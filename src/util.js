// Utilities

var fs = require( 'fs' );
var minimist = require( 'minimist' );
var through = require( 'through2' );

var argv = minimist( process.argv );

// A simple function to read all of stdin
module.exports.stdin_reader = function( func )
{
	// First acquire the complete stdin buffer
	process.stdin.setEncoding('utf8');
	var data = '';

	process.stdin.on( 'readable', function()
	{
		var chunk = process.stdin.read();
		if ( chunk !== null )
		{
			data += chunk;
		}
	});

	process.stdin.on( 'end', function()
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
