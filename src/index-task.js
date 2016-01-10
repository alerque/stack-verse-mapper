var gulp = require( 'gulp' );
var htmlToText = require( 'html-to-text' );
var through = require( 'through2' );
var xmlFlow = require( 'xml-flow' );

gulp.task( 'index', [ 'download' ], function()
{
	return gulp.src( 'data/*/Posts.xml', { buffer: false } )
		.pipe( xmlParser( extract_post_data ) )
		.pipe( logger() )
		//.pipe( gulp.dest( 'data' ) );
});

function xmlParser( func )
{
	return through.obj( function( file, enc, callback )
	{
		var self = this;
		var xmlStream = xmlFlow( file );
		var results = [];

		xmlStream.on( 'tag:row', function( data )
		{
			results.push( func( data ) );
		});

		xmlStream.on( 'end', function()
		{
			callback( null, results );
		});
	});
}

function logger()
{
	return through.obj( function( file, enc, callback )
	{
		console.log(file)
		callback()
	});
}

function extract_post_data( data )
{
	return {
		id: +data.id,
		type: +data.posttypeid,
		body: htmlToText.fromString( data.body, {
			wordwrap: false,
			ignoreHref: true,
		}),
		title: data.title,
	};
}
