// Functions to search the indexes we create

var _ = require( 'lodash' );

var bcv = require( './bcv_parser.js' ).bcv;
var util = require( '../src/util.js' );

// Search for a Bible reference
// NB. Currently only one verse reference query is supported

function search( query, index )
{
	query = bcv.parse( query ).osis();
	if ( !query )
	{
		return [];
	}
	var parsed_query = util.parse_ref( query );
	
	// Filter the posts (and their refs) which match with the query
	// (But we may do a bit of preanalysis too)
	var sets = {};
	var results = index.posts.map( function( post )
	{
		var post = _.cloneDeep( post );
		var matched = 0;
		post.refs = post.refs.map( function( ref )
		{
			if ( parsed_query.book === ref.book )
			{
				var q_start = parsed_query.start;
				var q_end = parsed_query.end || q_start;
				var r_start = ref.start;
				var r_end = ref.end || r_start;
				// Filter out non-overlapping refs
				if ( r_start > q_end || q_start > r_end )
				{
					return;
				}
				// Calculate the specificity while we're here
				ref.specificity = ( Math.abs( r_start - q_start ) + Math.abs( ( r_end || r_start ) - ( q_end || q_start ) ) ) / 2;
				matched = 1;
				return ref;
			}
		});
		
		if ( matched )
		{
			// Add this post to its question set
			var set = sets[ post.parent || post.id ];
			if ( !set )
			{
				set = sets[ post.parent || post.id ] = [];
			}
			set.push( post );
			
			// Check for matching title references before we clean up the refs array
			if ( post.title && post.title.length )
			{
				for ( var i = 0; i < post.title.length; i++ )
				{
					if ( post.refs[ post.title[i] ] )
					{
						post.QTH = 1;
						break;
					}
				}
			}
			delete post.title;
			post.refs = post.refs.filter( _.identity );
			return post;
		}
	})
	.filter( _.identity );
	
	// Analyse the filtered posts
	results = analyse( parsed_query, results );
	results = results.map( function( post )
	{
		return {
			id: post.id,
			type: post.type,
			title: index.questions[ post.parent || post.id ].title,
			specificity: post.specificity,
		};
	});
	return _.sortBy( results, 'specificity' );
}

// Pre-compute some data that will be needed for sorting
function analyse( parsed_query, posts )
{
	function most_specific_ref( post )
	{
		return post.refs.reduce( function( a, b )
		{
			return a.specificity < b.specificity ? a : b;
		});
	}
	return posts.map( function( post )
	{
		// Clone the post so that we don't contaminate the index
		var result = _.clone( post );
		result.most_specific_ref = most_specific_ref( post );
		result.specificity = result.most_specific_ref.specificity;
		return result;
	});
}

module.exports.search = search;
module.exports.analyse = analyse;
