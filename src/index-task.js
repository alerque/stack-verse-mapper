var _ = require( 'lodash' );
var child_process = require( 'child_process' );
var fs = require( 'fs' );
var gulp = require( 'gulp' );
var htmlToText = require( 'html-to-text' );
var path = require( 'path' );
var through = require( 'through2' );
var xmlFlow = require( 'xml-flow' );
var config = require( '../config.json' );

var bcv = require( './bcv_parser.js' ).bcv;
var util = require ( './util.js' );

gulp.task( 'index', [  ], function()
{
	return util.run_tasks({
		sites: config.sites,
		src: function( site ) { return './data/' + site + '/Posts.xml'; },
		dest: function( site ) { return './data/' + site + '/' + site + '-index.json'; },
		tasks: [ { path: './bin/parse_xml.js', label: 'parsing xml' }, ],
	});
});

gulp.task( 'index-2', [  ], function()
{
	var streamHandler = through.obj( function( file, enc, callback )
	{
		file.label = file.path.replace( file.base, '' );
		file.site = file.label.split( '/' )[0];
		console.log( file.site, file.contents.length );

		var child = child_process.fork( './bin/parse_xml.js', [], { silent: true } );

		/*child.on( 'message', function( msg )
		{
			console.log( parseInt( msg.progress / file.contents.length * 100 ) + '%' );
		});*/
		file.pipe( child.stdin );

		var writer = fs.createWriteStream( path.dirname( file.path ) + '/' + 'Posts.json' );
		child.stdout.pipe( writer );
		writer.on( 'finish', function()
		{
			console.log('write end');
			callback();
		});
	});

	return gulp.src( 'data/*/Posts.xml' )
		.pipe( streamHandler );
});

gulp.task( 'index-old', [ 'download' ], function()
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
		/*console.log( 'Parsing Verse references: ' + file.label );
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
		};*/
		fs.writeFile( path.dirname( file.path ) + '/' + file.site + '-index.json', JSON.stringify( data ), callback );
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
