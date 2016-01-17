// Functions to search the indexes we create

var _ = require( 'lodash' );

var bcv = require( './bcv_parser.js' ).bcv;
var util = require( '../src/util.js' );

// Search for a Bible reference
// NB. Currently only one verse reference query is supported

module.exports.search = function( query, index, options )
{
	// Default ranking options
	options = _.assign( {
		APS: function( SPEC )
		{
			return 180 - 25 * Math.log( SPEC + 1 );
		},
		TDRHP: 10,
		TDRHS: 20,
		QTM: 5,
		QTH: 5,
	}, options );
	
	// Parse the search query
	query = bcv.parse( query ).osis();
	if ( !query )
	{
		return [];
	}
	var parsed_query = util.parse_ref( query );
	
	// Filter the posts (and their refs) which match with the query
	// (But we may do a bit of preanalysis too)
	var set_hits = {};
	var results = index.posts.map( function( post )
	{
		var post = _.cloneDeep( post );
		var matched = 0;
		post.TDRHP = 0;
		post.QTH = 0;
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
				ref.specificity = ( Math.abs( r_start - q_start ) + Math.abs( r_end - q_end ) ) / 2;
				matched = 1;
				post.TDRHP += ref.count || 1;
				return ref;
			}
		});
		
		if ( matched )
		{
			// Add to set_hits
			set_hits[ post.parent || post.id ] = ( set_hits[ post.parent || post.id ] || 0 ) + post.TDRHP;
			
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
	results.forEach( function( post )
	{
		// Find the most specific reference
		post.SPEC = _.sortBy( post.refs, 'specificity' )[0].specificity;
		post.APS = options.APS( post.SPEC );
		// Count all the references in the post and set
		post.TDRHP = Math.min( post.TDRHP, options.TDRHP );
		post.TDRHS = Math.min( set_hits[ post.parent || post.id ], options.TDRHS );
		// Question tags and title
		var question = index.questions[ post.parent || post.id ];
		post.QTM = ( question.general_tag || question.tags && ( question.tags.indexOf( parsed_query.book ) !== -1 ) || 0 ) * options.QTM;
		post.QTH *= options.QTH;
		// And add up the Final Post Score
		post.FPS = post.APS + post.TDRHP + post.TDRHS + post.QTM + post.QTH;
		post.title = question.title;
	});
	
	// Now sort by the Final Post Score
	return _.orderBy( results, 'FPS', 'desc' );
};
