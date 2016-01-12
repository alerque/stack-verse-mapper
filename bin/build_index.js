#!/usr/bin/env node

// Parse Posts.json and build an index of the Bible verse references

var _ = require( 'lodash' );
var bcv = require( '../src/bcv_parser.js' ).bcv;
var util = require( '../src/util.js' );

util.stdin_reader( build_index );

// Build the index
function build_index( data )
{
	data = JSON.parse( data );
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
