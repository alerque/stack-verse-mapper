# The list of sites that we should build extentions for is maintained in  
# config.json file. The jq command parses this and gives us a text version.
# This can  be overridden from the command line with:
#     make SITES='site1 site2' [target]
SITES = $(shell jq -r '.sites[]' -- config.json)

# Location of the project so we don't cross-wire relative paths.
BASE := $(shell cd "$(shell dirname $(lastword $(MAKEFILE_LIST)))/" && pwd)

# Directory to store data. This can be overridden with an environment variable
# in the event you want to play with multiple data sets without deleting them.
DATA := $(BASE)/data

# Use bash instead of SH for fancier shell syntax and run each successive line
# in the same shell so that environment variables carry over.
SHELL = bash
.ONESHELL:

# Make two-passes at expanding make-specific variables so that we can use them
# in dependency names
.SECONDEXPANSION:
.SECONDARY:

# Mark which rules are not actually generating files
.PHONY: all clean setup Makefile

# Don't cleaanup our downloads as part of a regular cleanup cycle
.PRECIOUS: %.7z *-posts.json *-index.json

# Default rule to start from scratch and build everything
all: setup $(SITES)

# Add demo target to show off a sample
demo: setup hermeneutics
	gulp demo

# Rule installing and configuring the local environment
setup: node_modules

# rule for how we come by the node_modules folder
node_modules:
	npm install

# Rule to blow away our source data and start over
clean:
	-rm -r $(foreach SITE,$(SITES),$(DATA)/$(SITE))
	-rm *-{index,posts}.json

# Catch-all rule for building one site at a time, the target name is assumed
# to be a site name. For each site we want to end up with a completed index, so
# make that the dependency
%: %-index.json.gz
	@echo "Finished $*"

# Rule to build an index from a set of posts.
%-index.json: %-posts.json
	@echo "Rebuilding index for $*.stackexchange.com"
	./bin/build_index.js < $< > $@

# Rule to extract the source data and build a json version of the posts
%-posts.json: $(DATA)/%/Posts.xml
	@echo "Converting XML to JSON for $*.stackexchange.com"
	./bin/parse_xml.js --src=$< < $< > $@

# Any compressed targets are just...compressed versions of their inputs
%.gz: %
	gzip -f -k $<

# Rule for extracting the XML we need from the zips
$(DATA)/%/Posts.xml: | $(DATA)/%.stackexchange.com.7z
	mkdir -p $(DATA)/$*
	cd $(DATA)/$* && 7z e -y "$|" Posts.xml

# Rule for fetching site specific data dumps
$(DATA)/%.7z:
	mkdir -p $(DATA)
	./bin/fetch_dump.bash $*
