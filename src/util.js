// Utilities

var fs = require( 'fs' );
var minimist = require( 'minimist' );
var through = require( 'through2' );

var bcv = require( './bcv_parser.js' ).bcv;

var argv = minimist( process.argv.slice( 2 ) );

// A simple function to read all of stdin
module.exports.stdin_reader = function( func )
{
	var path = argv['_'][0];
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

// Create a through stream which will send progress messages to the parent process
module.exports.progress_stream = function( stream, total )
{
	var progress = 0;
	var handler = through( function( chunk, encoding, callback )
	{
		if ( process.send )
		{
			progress += chunk.length;
			process.send({
				progress: progress,
				total: total,
			});
		}
		callback( null, chunk );
	});
	return stream.pipe( handler );
};

// Parse a reference into book and verse-in-book numbers
var chapters = bcv.translations['default'].chapters;
var ref_pattern = /^(\w+)\.(\d+)\.(\d+)(-\w+\.(\d+)\.(\d+))?$/;
module.exports.parse_ref = function( ref )
{
	var matches = ref_pattern.exec( ref );
	var book = matches[1];
	var result = {
		// Don't retain the reference for now, we can always add it back in if needed
		//ref: ref,
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
