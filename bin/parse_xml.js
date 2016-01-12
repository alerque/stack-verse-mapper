#!/usr/bin/env node

// Parse Posts.xml from a Stack Exchange site archive, extracting the information we need

var htmlToText = require( 'html-to-text' );
var stream = require( 'stream' );
var xmlFlow = require( 'xml-flow' );
var util = require( '../src/util.js' );

// Read in from a supplied file name or stdin
util.stdin_reader( parse_xml );

function parse_xml( data )
{
	var src_stream = new stream.Readable();
	src_stream.push( data );
	src_stream.push( null );
	var xmlStream = xmlFlow( util.progress_stream( src_stream, data.length ) );
	var results = '';

	xmlStream.on( 'tag:row', function( data )
	{
		results += ',' + JSON.stringify( extract_post_data( data ) );
	});

	xmlStream.on( 'end', function()
	{
		process.stdout.write( '[' + results.slice( 1 ) + ']' );
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
