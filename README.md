# Stack Verse Mapper

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

* make (to configure and build the system)
* bash (to run various support scripts)
* curl (for downloading)
* 7z (to extract the data dumps)
* nodejs (to run the verse parser) + modules…
* python (to run scripts that parse the XML data dumps) + modules…
* sqlite (for storing and manipulating the index)
* ant (for generaating browser extentions from userscripts)

### Instalation & Usage

Eventually, the end user UI should just be a userscript or browser extention
instalation away.

### Development Setup & Usage

Clone this repository (or your own fork of it if you plan to contribute).

    git clone git@github.com:alerque/stack-verse-mapper.git

Download and setup the dependencies:

    make setup

Download and extract the data dump for all enabled sites:

    make all

That will take a while because it has to download all the relevant data dumps,
but it will ony happen once unless you delete the local data files. If you only
want to download and process one site, specify the site prefix (the part
before the .stackexchange.com in the URL), e.g.:

    make hermeneutics

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
