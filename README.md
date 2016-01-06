# Stack Verse Mapper
Index Bible verse references in Stack Exchange data dumps.

## The Idea

While not the first time such a feature has been discussed, the impetus to start this project was [ScottS's meta post]( http://meta.hermeneutics.stackexchange.com/q/3241/36).

## Status

Programming work has only just begun. The concept is being mapped out from posts on the meta site and organized into [issues](https://github.com/alerque/stack-verse-mapper/issues). Overall status can be tracked from the [milestones](https://github.com/alerque/stack-verse-mapper/milestones) page.

## Contributing

Anyone with ideas is invited to participate in the issue tracker adding how they think it should work or discussing implementation details.

Anyone that would like to contribute code is invited to fork this repo and extend it as they are able.
## Usage

So far the system is non-functional. If, as a programmer, you would like to play with the backend pieces as they come along, here is how they work.

### Requirements

The requirements list is likely to grow, but so far:

* make (to configure and build the system)
* bash (to run various support scripts)
* curl (for downloading)
* 7z (to extract the data dumps)
* nodejs (to run the verse parser)
* python (to run scripts that parse the XML data dumps)

### Setup

Clone this repository (or your own fork of it if you plan to contribute)

### Running

Download and exctact the data dump for a site (e.g. hermeneutics.stackexchange.com)

    ./init.bash <full_site_name>
