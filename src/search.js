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
	
	// First filter for posts which have an overlapping reference
	var results = filter( parsed_query, index.posts );
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

// Filter to posts which overlap with the query
function filter( parsed_query, posts )
{
	return posts.filter( function( post )
	{
		var i, q_start, q_end, r_start, r_end;
		for ( i = 0; i < post.refs.length; i++ )
		{
			if ( parsed_query.book === post.refs[i].book )
			{
				q_start = parsed_query.start;
				q_end = parsed_query.end || q_start;
				r_start = post.refs[i].start;
				r_end = post.refs[i].end || r_start;
				if ( ( r_start >= q_start && r_start <= q_end ) || ( r_end >= q_start && r_end <= q_end ) )
				{
					return true;
				}
			}
		}
	});
}

// Pre-compute some data that will be needed for sorting
function analyse( parsed_query, posts )
{
	function specificity( ref )
	{
		return ( Math.abs( ref.start - parsed_query.start ) + Math.abs( ( ref.end || ref.start ) - ( parsed_query.end || parsed_query.start ) ) ) / 2;
	}
	function most_specific_ref( post )
	{
		return post.refs.filter( function( ref )
		{
			return ref.book === parsed_query.book;
		})
		.reduce( function( a, b )
		{
			return specificity( a ) < specificity( b ) ? a : b;
		});
	}
	return posts.map( function( post )
	{
		// Clone the post so that we don't contaminate the index
		var result = _.clone( post );
		result.most_specific_ref = most_specific_ref( post );
		result.specificity = specificity( result.most_specific_ref );
		return result;
	});
}

module.exports.search = search;
module.exports.filter = filter;
module.exports.analyse = analyse;
