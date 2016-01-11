// Functions to search the indexes we create

var _ = require( 'lodash' );

var bcv = require( './bcv_parser.js' ).bcv;

// Search for a Bible reference
// NB. Currently only one reference is supported

// Rankings
//   1: normal result (query overlaps with at least one reference)
//   * 2: result in question
//   * 3: result in question title
//   * 5: exact match

function run_search( query, index )
{
	var query = bcv.parse( query ).osis();
	if ( !query )
	{
		return [];
	}
	var parsed_query = parse_ref( query );

	return _( index )
		.map( function( post )
		{
			var found,
			ranking = post.type === 'q' ? 2 : 1,
			result;

			if ( post.type === 'q' && post.title )
			{
				result = check_matches( parsed_query, post.title );
				if ( result )
				{
					found = 1;
					ranking = result * 3;
				}
			}
			if ( !found && post.body )
			{
				result = check_matches( parsed_query, post.body );
				if ( result )
				{
					found = 1;
					ranking *= result;
				}
			}
			if ( found )
			{
				return {
					id: post.id,
					type: post.type,
					ranking: ranking,
				};
			}
		})
		.filter( function( post )
		{
			return post;
		})
		.sortByOrder( 'ranking', 'desc' )
		.value();
}

// Check a query against a list of references
function check_matches( query, references )
{
	var ranking = 0;
	references.forEach( function( ref )
	{
		ref = parse_ref( ref );
		// Exact match
		if ( query.ref === ref.ref )
		{
			ranking = 5;
			return;
		}
		// Check book
		if ( query.book !== ref.book )
		{
			return;
		}
		// Check for non-overlapping references
		if ( query.end < ref.start || ref.end < query.start )
		{
			return;
		}
		ranking = 1;
	});
	return ranking;
}

// Parse a reference
function parse_ref( ref )
{
	var pattern = /^(\w+)\.(\d+)\.(\d+)(-\w+\.(\d+)\.(\d+))?$/;
	var start, end;
	var matches = pattern.exec( ref );
	start = +matches[2] + ( +matches[3] ) / 1000;
	end = matches[4] ? +matches[5] + ( +matches[6] ) / 1000 : start;
	return {
		ref: ref,
		book: matches[1],
		start: start,
		end: end,
	};
}

module.exports = run_search;
