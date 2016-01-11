#!/usr/bin/env node

// Parse Posts.xml from a Stack Exchange site archive, extracting the information we need

var htmlToText = require( 'html-to-text' );
var xmlFlow = require( 'xml-flow' );
var util = require ( '../src/util.js' );

// Parse the xml file
var xmlStream = xmlFlow( util.progress_stream( process.stdin ) );
var results = '';

xmlStream.on( 'tag:row', function( data )
{
	results += ',' + JSON.stringify( extract_post_data( data ) );
});

xmlStream.on( 'end', function()
{
	process.stdout.end( '[' + results.slice( 1 ) + ']' );
});

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
