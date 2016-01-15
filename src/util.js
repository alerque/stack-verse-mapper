// Utilities

var _ = require( 'lodash' );
var fs = require( 'fs' );
var path = require( 'path' );

var bcv = require( './bcv_parser.js' ).bcv;
var config = require( '../config.json' );
var tag_map = require( './tags.json' );

// A simple function to read all of stdin
module.exports.stdin_reader = function( func )
{
	var path = process.argv[2];
	var stream = !path || path === '-' ? process.stdin : fs.createReadStream( path );

	// First acquire the complete stdin buffer
	stream.setEncoding('utf8');
	var data = '';

	stream.on( 'readable', function()
	{
		var chunk = stream.read();
		if ( chunk !== null )
		{
			data += chunk;
		}
	});

	stream.on( 'end', function()
	{
		func( data );
	});
};

// Parse a reference into book and verse-in-book numbers
var chapters = bcv.translations['default'].chapters;
var ref_pattern = /^(\w+)\.(\d+)\.(\d+)(-\w+\.(\d+)\.(\d+))?$/;
module.exports.parse_ref = function( ref )
{
	var matches = ref_pattern.exec( ref );
	var book = matches[1];
	var result = {
		osis: ref,
		book: book,
		start: verse_in_book( book, +matches[2], +matches[3] ),
	};
	if ( matches[4] )
	{
		result.end = verse_in_book( book, +matches[5], +matches[6] );
	}
	return result;
};

// Calculate the verse number in the whole of a book
function verse_in_book( book, chapter, verse )
{
	var c = 0;
	var v = 0;
	while ( c + 1 < chapter )
	{
		v += chapters[ book ][ c ];
		c++;
	}
	return v + verse;
}

// Parse a post's tags, looking for books of the Bible
var site = path.basename( process.argv[2], '.json' ).split( '-' )[0];
var tag_cleanup_pattern = /((the-)?book(-of)?)|-/g;
tag_map = _.mapKeys( tag_map, function( value, key )
{
	return key.replace( tag_cleanup_pattern, '' );
});
module.exports.parse_tags = function( tags )
{
	tags = tags.split( /[<>]/ );
	var results =  _.flatMap( tags, function( tag )
	{
		return tag_map[ tag.replace( tag_cleanup_pattern, '' ) ];
	})
	.filter( _.identity );
	if ( results.length )
	{
		return _.uniq( results ).sort();
	}
	// Check for site defined general tags like bible, christianity or judaism
	if ( config.sites[ site ] && config.sites[ site ].tags )
	{
		for ( var i = 0; i < tags.length; i++ )
		{
			if ( config.sites[ site ].tags.indexOf( tags[i] ) !== -1 )
			{
				return true;
			}
		}
	}
};
