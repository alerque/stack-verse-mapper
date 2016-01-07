SITES = hermeneutics christianity judaism

BASE := $(shell cd "$(shell dirname $(lastword $(MAKEFILE_LIST)))/" && pwd)
SHELL = bash
.ONESHELL:
.SECONDEXPANSION:
.PHONY: all clean
.SECONDARY:
.PRECIOUS: %.7z

all: $(SITES)

clean:
	rm -rf $(foreach SITE,$(SITES),$(SITE).stackexchange.com)

%: %.stackexchange.com/Posts.xml
	@echo "Building index for $@.stackexchange.com"

%/Posts.xml: | %.7z
	mkdir -p $*
	cd $* && 7z e -y "$(BASE)/$|"

%.7z:
	./bin/fetch_dump.bash $*
