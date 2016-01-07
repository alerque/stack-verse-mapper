SITES = hermeneutics.stackexchange.com christianity.stackexchange.com
BASE := $(shell cd "$(shell dirname $(lastword $(MAKEFILE_LIST)))/" && pwd)

SHELL = bash
.ONESHELL:
.SECONDEXPANSION:
.PHONY: all clean
.SECONDARY:
.PRECIOUS: %.7z

all: $(SITES)

clean:
	rm -rf $(SITES)

%: %.7z
	mkdir -p $@
	cd $@ && 7z e "$(BASE)/$<"

%.7z:
	./bin/fetch_dump.bash $*
