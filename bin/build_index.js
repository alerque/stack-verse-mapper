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
	
	// Parse the verse references of the body and title
	var posts = data.map( function( post )
	{
		post.refs = bcv.parse( post.body ).osis().split( ',' );
		if ( post.title )
		{
			titles[ post.id ] = post.title;
			var title_refs = bcv.parse( post.title ).osis().split( ',' );
			post.refs = post.refs.concat( title_refs );
			post.title = _.uniq( title_refs ).sort();
		}
		// Filter out any blank strings
		post.refs = post.refs.filter( _.identity );
		if ( post.refs.length )
		{
			delete post.body;
			return post;
		}
	})
	// Filter posts without any references
	.filter( _.identity )
	.map( function( post )
	{
		// Count duplicate references
		post.refs = _( post.refs ).countBy()
		// Calculate book-in-verse numbers for the references
		.map( function( count, ref )
		{
			var ref = util.parse_ref( ref );
			ref.count = count;
			return ref;
		})
		.sortBy( 'osis' )
		.value();
		
		// Store title references as indexes to refs
		if ( post.title )
		{
			post.title = _.without( post.title.map( function( ref )
			{
				return _.findIndex( post.refs, [ 'osis', ref ] );
			}), -1 );
		}
		
		// Preserve the title of this post
		title_references[ post.parent || post.id ] = true;
		return post;
	});
	
	// Filter the list of titles
	// TODO: check if lodash ever adds a .pickBy() that passes the key
	titles = _.pickBy( _.mapValues( titles, function( title, id )
	{
		if ( title_references[ id ] )
		{
			return title;
		}
	}) );
	
	var output = {
		posts: posts,
		titles: titles,
	};
	process.stdout.write( JSON.stringify( output ) );
}
