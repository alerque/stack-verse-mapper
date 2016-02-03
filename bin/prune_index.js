#!/usr/bin/env node

// Prune an index to remove anything the web site won't need

var fs = require( 'fs' );
var getRawBody = require( 'raw-body' );

// Read from the requested file name
getRawBody( fs.createReadStream( process.argv[2] ), 'utf8', prune_index );

function prune_index( err, data )
{
	data = JSON.parse( data );

	data.posts.forEach( function( post )
	{
		delete post.type;
		if ( post.title && post.title.length === 0 )
		{
			delete post.title;
		}
		post.refs.forEach( function( ref )
		{
			delete ref.osis;
			if ( ref.count === 1 )
			{
				delete ref.count;
			}
		});
	});

	process.stdout.write( JSON.stringify( data ) );
}
