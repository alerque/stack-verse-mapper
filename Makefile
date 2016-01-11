SITES = hermeneutics christianity judaism islam history skeptics

BASE := $(shell cd "$(shell dirname $(lastword $(MAKEFILE_LIST)))/" && pwd)
DATA := $(BASE)/data
SHELL = bash
.ONESHELL:
.SECONDEXPANSION:
.PHONY: all clean setup Makefile
.SECONDARY:
.PRECIOUS: %.7z

all: setup $(SITES)

setup: node_modules

node_modules:
	npm install

clean:
	rm -rf $(foreach SITE,$(SITES),$(DATA)/$(SITE))

%: %.txt.gz
	@echo "Finished $*"

%.txt: $(DATA)/%/Posts.xml
	@echo "Rebuilding index for $*.stackexchange.com"
	./bin/map_references.js $< $* > $@

%.txt.gz: %.txt
	gzip -k $<

$(DATA)/%/Posts.xml: | $(DATA)/%.stackexchange.com.7z
	mkdir -p $(DATA)/$*
	cd $(DATA)/$* && 7z e -y "$|"

$(DATA)/%.7z:
	mkdir -p $(DATA)
	./bin/fetch_dump.bash $*
