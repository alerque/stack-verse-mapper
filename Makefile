# The list of sites that we should build extentions for is maintained in
# config.json file. The jq command parses this and gives us a text version.
# This can  be overridden from the command line with:
#     make SITES='site1 site2' [target]
SITES = $(shell jq -r '.sites | keys[]' -- config.json)

# Default to running multiple jobs
JOBS := $(shell nproc 2>/dev/null || sysctl -n hw.ncpu 2>/dev/null || echo 1)
MAKEFLAGS = "-j $(JOBS)"

# Location of the project so we don't cross-wire relative paths.
BASE := $(shell cd "$(shell dirname $(lastword $(MAKEFILE_LIST)))/" && pwd)

# Directory to store data. This can be overridden with an environment variable
# in the event you want to play with multiple data sets without deleting them.
DATA := $(BASE)/data
STATIC := $(BASE)/gh-pages

# Use bash instead of SH for fancier shell syntax and run each successive line
# in the same shell so that environment variables carry over.
SHELL = bash
.ONESHELL:

# Make two-passes at expanding make-specific variables so that we can use them
# in dependency names
.SECONDEXPANSION:
.SECONDARY: $(wildcard **.js{,on})

# Mark which rules are not actually generating files
.PHONY: all clean demo demotest deploy gh-pages-init gh-pages-publish setup test travis Makefile

# Don't cleaanup our downloads as part of a regular cleanup cycle
.PRECIOUS: %.7z *-posts.json *-index.json

# Add node modules to our path so we can call them from make
PATH := $(shell npm bin):$(PATH)

# Travis sets this to true, so we can use /bin/true and /bin/false for quick tests
TRAVIS ?= false

# We use the SHA of the current commit to republish
SHA = $(shell git rev-parse --short HEAD)

# Default rule to start from scratch and build everything
all: setup $(SITES)

# Add demo target to show off a sample
demo: setup hermeneutics
	./bin/demo.js hermeneutics "Rev 5:1"

# Rule installing and configuring the local environment
setup: node_modules
	./bin/git-restore-mtime-bare.py

# rule for how we come by the node_modules folder
node_modules: package.json
	npm prune
	npm install

# Rule to blow away our source data and start over
clean:
	rm -rf $(foreach SITE,$(SITES),$(DATA)/$(SITE))
	rm -f $(DATA)/*-{index,posts}.json{,.gz}

# Run some automated tests
test: setup
	eslint .

# Catch-all rule for building one site at a time, the target name is assumed
# to be a site name. For each site we want to end up with a completed index, so
# make that the dependency
$(SITES): $(DATA)/$$@-index.json

# Rule to build an index from a set of posts.
$(DATA)/%-index.json: $(DATA)/%-posts.json config.json bin/build_index.js src/bcv_parser.js src/tags.json src/util.js
	./bin/build_index.js $< | jq . > $@

# Rule to extract the source data and build a json version of the posts
$(DATA)/%-posts.json: $(DATA)/%/Posts.xml bin/parse_xml.js
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

# This is the target for Travis-CI to test
travis: test demotest

# Shortcut to publish all the things
deploy: gh-pages-publish
	cd $(STATIC) && git push origin HEAD:gh-pages

# Islam is a slightly smaller to download, but Hermeneutics gives us a more
# options for testing actual results
demotest: setup hermeneutics
	./bin/demo.js hermeneutics 'Rev 22:21' | grep -q 'a/13495'

# Rule for fetching site specific data dumps. This checks if the site exists,
# then attempts to update or resume downloading the dump file.
$(DATA)/%.7z:
	mkdir -p $(DATA)
	curl -o /dev/null -s -f -I $(call archive_url,$*)
	curl -o "data/$*.7z" -s --continue - $(call archive_url,$*)

# Rule for generating static site
gh-pages: gh-pages-init $(foreach SITE,$(SITES),$(STATIC)/data/$(SITE)-index.json) $(addprefix $(STATIC)/index.,html css min.js)

# For local copies, worktree is saner to work with but Travis's git is too old
# so the clone route is to keep it happy.
gh-pages-init:
	test -d $(STATIC) && ( cd $(STATIC) && git pull ) ||:
	$(TRAVIS) || ( test -d $(STATIC) || ( \
		git worktree prune ;\
		git worktree add $(STATIC) gh-pages ;\
		)) ||:
	$(TRAVIS) && ( test -d $(STATIC) || ( \
		git clone --branch=gh-pages git@github.com:${TRAVIS_REPO_SLUG}.git $(STATIC) ;\
		cd $(STATIC) ;\
		git checkout gh-pages ;\
		git remote add parent $(BASE) ;\
		git fetch --unshallow --all ;\
		)) ||:
	cd $(STATIC) && $(BASE)/bin/git-restore-mtime-bare.py

gh-pages-publish: gh-pages
	( cd $(STATIC) ;\
		$(TRAVIS) && git add -A || git add -u ;\
		git commit -C "$(SHA)" && \
			git commit --amend -m "Publish static site from $(SHA)" ||: )

$(STATIC)/%.html: $$(addprefix src/%.,hbs less js) package.json config.json $(foreach SITE,$(SITES),$(STATIC)/data/$(SITE)-index.web.json) | gh-pages-init
	handlebars <(jq -s \
		'{ package: .[0], config: .[1], date: "$(shell date)", sha: "$(SHA)" }' \
		package.json config.json) < $< > $@

$(STATIC)/%.css: src/%.less
	lessc $< $@

$(STATIC)/%.min.js: $(STATIC)/%.js
	uglifyjs $< -c -o $@ --source-map $@.map

$(STATIC)/%.web.json: $(STATIC)/%.json
	jq -c . < $< > $@

$(STATIC)/%.js: src/%.js $$(shell $(shell npm bin)/browserify --list src/%.js)
	browserify $< -o $@

$(STATIC)/data/%: $(DATA)/% | gh-pages-init
	cp -p $< $@
