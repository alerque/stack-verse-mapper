var bcv_parser = require( 'bible-passage-reference-parser/js/en_bcv_parser' );
var config = require( '../config.json' );

var opts = config;

/*
if ( typeof site === 'string' )
{
	opts.include_apocrypha = config.sites[site].include_apocrypha;
	opts.include_chapters = config.sites[site].include_chapters;
	if ( typeof config.sites[site].bcv_options !== 'undefined' )
	{
		for ( var attr in config.sites[site].bcv_options )
		{
			opts.bcv_options[attr] = config.sites[site].bcv_options[attr];
		}
	}
}
*/

// Our standard bcv parser;
var bcv = new bcv_parser.bcv_parser;
bcv.include_apocrypha( opts.include_apocrypha );
bcv.set_options( opts.bcv_options );

module.exports.bcv = bcv;
