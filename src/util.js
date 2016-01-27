// Utilities

var bcv = require( './bcv_parser.js' ).bcv;

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
