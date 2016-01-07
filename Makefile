SITES = hermeneutics.stackexchange.com christianity.stackexchange.com

all: $(SITES)

clean:
	rm -rf $(SITES)

%:
	./bin/fetch_dump.bash $@
