var _ = require( 'lodash' );
var bcv_parser = require( 'bible-passage-reference-parser/js/en_bcv_parser' );
var fs = require( 'fs' );
var gulp = require( 'gulp' );
var htmlToText = require( 'html-to-text' );
var path = require( 'path' );
var through = require( 'through2' );
var xmlFlow = require( 'xml-flow' );

var bcv = new bcv_parser.bcv_parser;
bcv.include_apocrypha( true );
bcv.set_options({
	consecutive_combination_strategy: "separate",
	osis_compaction_strategy: "bcv",
	book_sequence_strategy: "include",
	invalid_sequence_strategy: "ignore",
	sequence_combination_strategy: "separate",
	punctuation_strategy: "us",
	invalid_passage_strategy: "ignore",
	non_latin_digits_strategy: "ignore",
	passage_existence_strategy: "bcv",
	zero_chapter_strategy: "error",
	zero_verse_strategy: "allow",
	single_chapter_1_strategy: "verse",
	book_alone_strategy: "ignore",
	book_range_strategy: "ignore",
	captive_end_digits_strategy: "delete",
	end_range_digits_strategy: "verse",
	ps151_strategy: "c",
	versification_system: "default",
	case_sensitive: "none"
});

gulp.task( 'index', [ 'download' ], function()
{
	var streamHandler = through.obj( function( file, enc, callback )
	{
		file.label = file.path.replace( file.base, '' );
		file.site = file.label.split( '/' )[0];
		create_index( file, callback );
	});

	return gulp.src( 'data/*/Posts.xml', { buffer: false } )
		.pipe( streamHandler );
});

function create_index( file, callback )
{
	xmlParser( file, extract_post_data, function( data )
	{
		console.log( 'Parsing Verse references: ' + file.label );
		data = _( data )
			.map( function( post )
			{
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

		data = {
			site: file.site,
			posts: data,
		};
		fs.writeFile( path.dirname( file.path ) + '/' + file.site + '-index.json', JSON.stringify( data ), callback );
		//callback();
	});
}

function xmlParser( file, func, callback )
{
	console.log( 'Parsing XML: ' + file.label );
	var xmlStream = xmlFlow( file );
	var results = [];

	xmlStream.on( 'tag:row', function( data )
	{
		results.push( func( data ) );
	});

	xmlStream.on( 'end', function()
	{
		callback( results );
	});
}

function extract_post_data( data )
{
	return {
		id: +data.id,
		type: +data.posttypeid === 1 ? 'q' : 'a',
		body: htmlToText.fromString( data.body, {
			wordwrap: false,
			ignoreHref: true,
		}),
		title: data.title,
	};
}
