# Stack Verse Mapper

Index Bible verse references in Stack Exchange data dumps.

## The Idea

While not the first time such a feature has been discussed, the impetus to
start this project was [ScottS's meta post][meta].

## Status

Programming work has only just begun. The concept is being mapped out from
discussion on the [meta post][meta] and organized into [issues][issues].
Overall status can be tracked from the [milestones][milestones] page.

## Contributing

Anyone with ideas is invited to participate in the issue tracker—adding how
they think it should work or discussing implementation details.

Anyone that would like to contribute code is invited to fork this repo and
extend it as they are able.

## Usage

So far the system is non-functional. If, as a programmer, you would like to
play with the backend pieces as they come along, here is how they work.

### Requirements

#### To use:

* Web browser with userscript manager (Greasemonkey for FF, Tampermorkey for
  Chrome, etc.)

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

Clone this repository (or your own fork of it if you plan to contribute)

Download and extact the data dump for all enabled sites:

    make

Or for just a specific site with the full site name:

    make hermeneutics.stackexchange.com

 [meta]: http://meta.hermeneutics.stackexchange.com/q/3241/36
 [issues]: https://github.com/alerque/stack-verse-mapper/issues
 [milestones]: https://github.com/alerque/stack-verse-mapper/milestones
