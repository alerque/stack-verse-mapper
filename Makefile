# The list of sites that we should build extentions for is maintained in  
# config.json file. The jq command parses this and gives us a text version.
# This can  be overridden from the command line with:
#     make SITES='site1 site2' [target]
SITES = $(shell jq -r '.sites | keys[]' -- config.json)

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
.PHONY: all clean setup gh-pages-init Makefile

# Don't cleaanup our downloads as part of a regular cleanup cycle
.PRECIOUS: %.7z *-posts.json *-index.json

# Add node modules to our path so we can call them from make
PATH := $(shell npm bin):$(PATH)

# Default rule to start from scratch and build everything
all: setup $(SITES)

# Add demo target to show off a sample
demo: setup hermeneutics
	./bin/search.js hermeneutics "Rev 5:1"

# Rule installing and configuring the local environment
setup: node_modules

# rule for how we come by the node_modules folder
node_modules:
	npm prune
	npm install

# Rule to blow away our source data and start over
clean:
	rm -rf $(foreach SITE,$(SITES),$(DATA)/$(SITE))
	rm -f $(DATA)/*-{index,posts}.json{,.gz}

# Catch-all rule for building one site at a time, the target name is assumed
# to be a site name. For each site we want to end up with a completed index, so
# make that the dependency
$(SITES): $(DATA)/$$@-index.json
	@echo "Finished $@"

# Rule to build an index from a set of posts.
$(DATA)/%-index.json: $(DATA)/%-posts.json bin/build_index.js src/util.js src/bcv_parser.js
	@echo "Rebuilding index for $*.stackexchange.com"
	./bin/build_index.js $< | jq . > $@

# Rule to extract the source data and build a json version of the posts
$(DATA)/%-posts.json: $(DATA)/%/Posts.xml bin/parse_xml.js src/util.js
	@echo "Converting XML to JSON for $*.stackexchange.com"
	./bin/parse_xml.js $< | jq . > $@

# Rule for extracting the XML we need from the zips
$(DATA)/%/Posts.xml: | $(DATA)/%.stackexchange.com.7z
	mkdir -p $(DATA)/$*
	cd $(DATA)/$* && 7z e -y "$|" Posts.xml

# Rule for outputing compressed versions or any input
%.gz: %
	gzip -f -k $<

# Find the mirror site and get the actual dump URL for a site. The permalink
# redirects to an automatically chosen mirror, but the redirect does not return
# a 404 error if the site doesn't exist. Besides this, we can't resume downloads
# against a redirect URL anyway so we need to follow it and find the target.
define archive_url
$(shell curl -w "%{url_effective}" -I -L -s -S https://archive.org/download/stackexchange/$(1).7z -o /dev/null)
endef

travis: setup gh-pages

# Rule for fetching site specific data dumps. This checks if the site exists,
# then attempts to update or resume downloading the dump file.
$(DATA)/%.7z:
	mkdir -p $(DATA)
	curl -o /dev/null -s -f -I $(call archive_url,$*)
	curl -o "data/$*.7z" --continue - --progress $(call archive_url,$*)

# Rule for generating static site
gh-pages: gh-pages-init gh-pages/index.html

# For local copies, worktree is saner to work with but Travis's git is too old
# so the clone route is to keep it happy.
gh-pages-init:
	-git worktree list | grep -q '\[gh-pages\]$$' || git worktree add gh-pages gh-pages
	test -d gh-pages || git clone --branch=gh-pages $(shell git remote -v | head -n1 | awk '{print $$2}') gh-pages

gh-pages/index.html: src/index.hbs package.json config.json $(foreach SITE,$(SITES),gh-pages/data/$(SITE)-index.json)
	handlebars <(jq --slurpfile config config.json < package.json '{package: ., config: $$config[]}') < $< > $@

gh-pages/data/%: $(DATA)/%
	cp $^ $@
