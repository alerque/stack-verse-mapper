# Stack Verse Mapper

[![Build Status](https://travis-ci.org/alerque/stack-verse-mapper.svg?branch=master)](https://travis-ci.org/alerque/stack-verse-mapper)

Index any and all references to Bible verses in Stack Exchange sites using the
public data dumps and inject matches from this index into search results for
each site using a user-script.

Support for [Biblical Hermeneutics][bh], [Christianity][cse],
[Judaism][miyodeya], [Islam][islam], [History][history], and
[Skeptics][skeptics] is planned for the user-scipt out of the box, but you will
be able to add other sites manually if you rebuild the index. Once the
data-dump is processes and an index is generated, the index data will be saved
locally by the browser so no third party site is involved.

## Status

While not the first time such a feature has been discussed, the impetus to
start this project was [this meta post][meta]. Programming work has only
just begun. The concept is being mapped out and organized into
[issues][issues]. Overall status can be tracked from the
[milestones][milestones] page.

## Contributing

Anyone with ideas is invited to participate in the issue tracker—adding how
they think it should work or discussing implementation details.

Anyone that would like to contribute code is invited to fork this repo and
extend it as they are able.

## Usage

So far the system is non-functional. If, as a programmer, you would like to
play with the backend pieces as they come along, read on…

### Requirements

#### To use:

* Web browser with userscript manager ([Greasemonkey][gm] for Firefox,
  [Tampermorkey][tm] for Chrome, etc.)

#### To build, tinker, or regenerate the index:

(These are projected as some of this isn't implemented yet and actual
dependencies will depend on who implements what. See the discussion in
[issue #5](https://github.com/alerque/stack-verse-mapper/issues/5).)

* make, bash, curl, 7z, gzip, jq
* nodejs, npm

### Installation & Usage

Eventually, the end user UI should just be a userscript or browser extention
installation away.

### Development Setup & Usage

Clone this repository (or your own fork of it if you plan to contribute).

    git clone git@github.com:alerque/stack-verse-mapper.git

To get a quick and dirty sample of running a query, run

    make demo

To download the data dumps and build indexes for all enabled sites:

    make all

That will take a *long time* because it has to download all the relevant data
dumps. The downloads will be preserved, so future index rebuilds will be
faster. You can also speed up the process by building more than one index in
parallel:

    make -j8 all

If you'd like to build just one site, specify the site prefix (the part before
the .stackexchange.com in the site's URL), e.g.:

    make hermeneutics

Each site generated will produce a queryable index of posts with references
in `<site>-index.json`.

Once indexes are generated, you can search from the command line by passing a
site and a query to the search script:

    ./bin/search hermeneutics 'Rev 5:1'

 [meta]: http://meta.hermeneutics.stackexchange.com/q/3241/36
 [issues]: https://github.com/alerque/stack-verse-mapper/issues
 [milestones]: https://github.com/alerque/stack-verse-mapper/milestones
 [bh]: http://hermeneutics.stackexchange.com
 [cse]: http://christianity.stackexchange.com/
 [miyodeya]: http://judaism.stackexchange.com/
 [islam]: http://islam.stackexchange.com/
 [history]: http://history.stackexchange.com/
 [skeptics]: http://skeptics.stackexchange.com/
 [gm]: https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/
 [tm]: https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo
