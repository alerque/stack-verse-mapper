#!/usr/bin/env node

// Parse Posts.xml from a Stack Exchange site archive, extracting the information we need

var fs = require( 'fs' );
var htmlToText = require( 'html-to-text' );
var url_parse = require( 'url' ).parse;
var xmlFlow = require( 'xml-flow' );

// Read in from a supplied file name or stdin
var path = process.argv[2];
var src_stream = !path || path === '-' ? process.stdin : fs.createReadStream( path );
var xmlStream = xmlFlow( src_stream );
var results = '';

xmlStream.on( 'tag:row', function( data )
{
	// Filter out tag wikis
	var type = +data.posttypeid;
	if ( type === 1 || type === 2 )
	{
		results += ',' + JSON.stringify( extract_post_data( data ) );
	}
});

xmlStream.on( 'end', function()
{
	process.stdout.write( '[' + results.slice( 1 ) + ']' );
});

function extract_post_data( data )
{
	var body = htmlToText.fromString( data.body, {
		wordwrap: false,
	}).replace( /\[(\w+:\/\/[^\]]+)\]/g, extract_translations );

	var post = {
		id: +data.id,
		type: +data.posttypeid === 1 ? 'q' : 'a',
		body: body,
	};

	if ( post.type === 'q' )
	{
		post.title = data.title;
		post.tags = data.tags;
	}
	if ( post.type === 'a' )
	{
		post.parent = +data.parentid;
	}
	return post;
}

// Extract translations from URLs
function extract_translations( match, url )
{
	url = url_parse( url, true );
	var result;

	// Check for known Bible sites
	if ( /biblegateway.com$/i.test( url.hostname ) )
	{
		result = url.query.version;
	}
	else if ( /blueletterbible.org$/i.test( url.hostname ) )
	{
		// Support their old and new format URLs
		if ( url.query && url.query.t )
		{
			result = url.query.t;
		}
		else
		{
			result = url.pathname.split( '/' )[1];
		}
	}
	return result ? result.toUpperCase() : '';
}
