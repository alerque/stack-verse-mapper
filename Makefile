SITES = hermeneutics christianity

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

$(SITES): $$@.stackexchange.com/Posts.xml

%/Posts.xml: | %.7z
	mkdir -p $*
	cd $* && 7z e -y "$(BASE)/$|"

%.7z:
	./bin/fetch_dump.bash $*