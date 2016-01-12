#!/usr/bin/env node

// Extract Posts.xml from a site archive

var _ = require( 'lodash' );
var fs = require( 'fs' );
var minimist = require( 'minimist' );
var Promise = require( 'bluebird' );
var ttys = require( 'ttys' );
var Zip = new ( require( 'node-7z' ) )();

var argv = minimist( process.argv );
var dest_file_path = argv.dest + '/Posts.xml';

// Check whether we need to unzip the file
new Promise( function( resolve, reject )
{
	fs.stat( dest_file_path, function( err, stats )
	{
		if ( err )
		{
			resolve( true );
		}
		else
		{
			var files = [];
			return Zip.list( argv.zip )
			.progress( function( entries )
			{
				files = files.concat( entries )
			})
			.then( function()
			{
				var file = _.filter( files, 'name', 'Posts.xml' )[0];
				resolve( stats.mtime.getTime() !== file.date.getTime() || stats.size !== file.size );
			})
		}
	});
})
.then( function( unzipping_needed )
{
	if ( !unzipping_needed )
	{
		return Promise.resolve();
	}
	// Unzip the file
	if ( process.send )
	{
		process.send({ throbber: true });
	}
	return Zip.extract( argv.zip, argv.dest, { wildcards: [ 'Posts.xml' ] } )
	.then( function()
	{
		if ( process.send )
		{
			process.send({ throbber: false });
		}
		return Promise.resolve();
	});
})
.then( function()
{
	process.exit();
});
