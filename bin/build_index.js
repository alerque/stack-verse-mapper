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
	
	var titles = {};
	var title_references = {};
	var posts = data.map( function( post )
	{
		// Parse the verse references
		post.body = bcv.parse( post.body ).osis();
		if ( post.title )
		{
			titles[ post.id ] = post.title;
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
			post.body = _.uniq( post.body.split( ',' ) )
				.map( util.parse_ref );
		}
		if ( post.title )
		{
			post.title = _.uniq( post.title.split( ',' ) )
				.map( util.parse_ref );
		}
		// Preserve the title of this post
		title_references[ post.type === 'q' ? post.id : post.parent ] = true;
		return post;
	});
	
	// Filter the list of titles
	titles = _.pick( titles, function( title, id )
	{
		return title_references[ id ];
	});
	
	var output = {
		posts: posts,
		titles: titles,
	};
	process.stdout.write( JSON.stringify( output ) );
}
