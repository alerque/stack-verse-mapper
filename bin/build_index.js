#!/usr/bin/env node

// Parse Posts.json and build an index of the Bible verse references

var _ = require( 'lodash' );
var bcv = require( '../src/bcv_parser.js' ).bcv;
var fs = require( 'fs' );
var getRawBody = require( 'raw-body' );
var path = require( 'path' );
var util = require( '../src/util.js' );

var config = require( '../config.json' );
var tag_map = require( '../src/tags.json' );

// Read from the requested file name
getRawBody( fs.createReadStream( process.argv[2] ), 'utf8', build_index );

// Build the index
function build_index( err, data )
{
	data = JSON.parse( data );
	
	var questions = {};
	var questions_references = {};
	
	// Parse the verse references of the body and title
	var posts = data.map( function( post )
	{
		post.refs = bcv.parse( post.body ).osis().split( ',' );
		if ( post.type === 'q' )
		{
			questions[ post.id ] = { title: post.title };
			var title_refs = bcv.parse( post.title ).osis().split( ',' );
			post.refs = post.refs.concat( title_refs );
			post.title = _.uniq( title_refs ).sort();
			
			// Process tags
			var tags = parse_tags( post.tags );
			if ( _.isArray( tags ) )
			{
				questions[ post.id ].tags = tags;
			}
			else if ( tags )
			{
				questions[ post.id ].general_tag = 1;
			}
		}
		// Filter out any blank strings
		post.refs = post.refs.filter( _.identity );
		if ( post.refs.length )
		{
			delete post.body;
			delete post.tags;
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
			ref = util.parse_ref( ref );
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
		questions_references[ post.parent || post.id ] = true;
		return post;
	});
	
	// Filter the list of titles
	questions = _.pickBy( questions, function( title, id )
	{
		return questions_references[ id ];
	});
	
	var output = {
		posts: posts,
		questions: questions,
	};
	process.stdout.write( JSON.stringify( output ) );
}

// Parse a post's tags, looking for books of the Bible
var site = path.basename( process.argv[2], '.json' ).split( '-' )[0];
var tag_cleanup_pattern = /((the-)?book(-of)?)|-/g;
tag_map = _.mapKeys( tag_map, function( value, key )
{
	return key.replace( tag_cleanup_pattern, '' );
});

function parse_tags( tags )
{
	tags = tags.split( /[<>]/ );
	var results =  _.flatMap( tags, function( tag )
	{
		return tag_map[ tag.replace( tag_cleanup_pattern, '' ) ];
	})
	.filter( _.identity );
	if ( results.length )
	{
		return _.uniq( results ).sort();
	}
	// Check for site defined general tags like bible, christianity or judaism
	if ( config.sites[ site ] && config.sites[ site ].tags )
	{
		for ( var i = 0; i < tags.length; i++ )
		{
			if ( config.sites[ site ].tags.indexOf( tags[i] ) !== -1 )
			{
				return true;
			}
		}
	}
}
