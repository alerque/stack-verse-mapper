SITES = hermeneutics christianity judaism

BASE := $(shell cd "$(shell dirname $(lastword $(MAKEFILE_LIST)))/" && pwd)
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
	rm -rf $(foreach SITE,$(SITES),$(SITE).stackexchange.com)

%: %.stackexchange.com/Posts.xml
	@echo "Building index for $@.stackexchange.com"
	./bin/map_references.js $< $*

%/Posts.xml: | %.7z
	mkdir -p $*
	cd $* && 7z e -y "$(BASE)/$|"

%.7z:
	./bin/fetch_dump.bash $*
