#!/usr/bin/env node

// Parse Posts.xml from a Stack Exchange site archive, extracting the top domains

var _ = require( 'lodash' );
var fs = require( 'fs' );
var htmlToText = require( 'html-to-text' );
var url_parse = require( 'url' ).parse;
var xmlFlow = require( 'xml-flow' );

// Read in from a supplied file name
var xmlStream = xmlFlow( fs.createReadStream( process.argv[2] ) );
var results = {};

xmlStream.on( 'tag:row', function( data )
{
	// Filter out tag wikis
	var type = +data.posttypeid;
	if ( type === 1 || type === 2 )
	{
		extract_post_data( data );
	}
});

xmlStream.on( 'end', function()
{
	results = _.toPairs( results ).filter( domain => domain[1].count > 1 ).sort( ( a, b ) => b[1].count - a[1].count );
	process.stdout.write( JSON.stringify( results ) );
});

function extract_post_data( data )
{
	htmlToText.fromString( data.body, {
		wordwrap: false,
	}).replace( /\[(\w+:\/\/[^\]]+)\]/g, extract_domains );
}

// Extract domains
function extract_domains( match, url )
{
	url = url_parse( url );

	if ( !results[ url.hostname ] )
	{
		results[ url.hostname ] = {
			count: 0,
			paths: {},
		};
	}
	results[ url.hostname ].count++;
	if ( !results[ url.hostname ].paths[ url.pathname ] )
	{
		results[ url.hostname ].paths[ url.pathname ] = 0;
	}
	results[ url.hostname ].paths[ url.pathname ]++;
}
