#!/usr/bin/env node

// Parse Posts.json and build an index of the Bible verse references

var _ = require( 'lodash' );
var bcv = require( '../src/bcv_parser.js' ).bcv;

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
	build_index( JSON.parse( data ) );
});

// Now to build the index
function build_index( data )
{
	var total = data.length, count = 0;

	data = _( data )
	.map( function( post )
	{
		// First send a progress message
		if ( process.send && ( count++ % 100 ) === 0 )
		{
			process.send({
				total: total,
				progress: count,
			});
		}
		// Parse the verse references
		post.body = bcv.parse( post.body ).osis();
		if ( post.title )
		{
			post.title = bcv.parse( post.title ).osis();
		}
		if ( !post.body )
		{
			delete post.body;
		}
		if ( !post.title )
		{
			delete post.title;
		}
		return post;
	})
	.filter( function( post )
	{
		// Filter out posts without any references
		return post.body || post.title;
	})
	.map( function( post )
	{
		// Split the osis comma separated references
		if ( post.body )
		{
			post.body = _.uniq( post.body.split( ',' ) );
		}
		if ( post.title )
		{
			post.title = _.uniq( post.title.split( ',' ) );
		}
		return post;
	})
	.value();

	process.stdout.write( JSON.stringify( data ) );
}
