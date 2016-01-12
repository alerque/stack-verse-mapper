#!/usr/bin/env node

// Parse Posts.xml from a Stack Exchange site archive, extracting the information we need

var fs = require( 'fs' );
var htmlToText = require( 'html-to-text' );
var minimist = require( 'minimist' );
var xmlFlow = require( 'xml-flow' );
var util = require( '../src/util.js' );

var argv = minimist( process.argv );

// Start when the previous task ends
util.stdin_reader( parse_xml );

function parse_xml()
{
	// Parse the xml file
	fs.stat( argv.src, function( err, stats )
	{
		var src_stream = fs.createReadStream( argv.src );
		var xmlStream = xmlFlow( util.progress_stream( src_stream, stats.size ) );
		var results = '';

		xmlStream.on( 'tag:row', function( data )
		{
			results += ',' + JSON.stringify( extract_post_data( data ) );
		});

		xmlStream.on( 'end', function()
		{
			process.stdout.write( '[' + results.slice( 1 ) + ']' );
		});
	});
}

function extract_post_data( data )
{
	return {
		id: +data.id,
		type: +data.posttypeid === 1 ? 'q' : 'a',
		body: htmlToText.fromString( data.body, {
			wordwrap: false,
			ignoreHref: true,
		}),
		title: data.title,
	};
}
