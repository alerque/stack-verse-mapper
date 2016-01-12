var del = require( 'del' );
var gulp = require( 'gulp' );
var config = require( './config.json' );

var task_runner = require( './src/task_runner.js' );
require( './src/download-task.js' );

gulp.task( 'default', [ 'index' ] );

gulp.task( 'clean', function ()
{
	return del( ['data/**/*',] );
});

gulp.task( 'index', [], function()
{
	return task_runner({
		sites: config.sites,
		data: './data',
		dest: function( site ) { return './data/' + site + '/' + site + '-index.json'; },
		tasks: [
			{
				label: 'unzipping Posts.xml',
				path: './bin/unzip_archive.js',
				argv: function( site )
				{
					return [
						'--zip=./data/' + site + '.stackexchange.com.7z',
						'--dest=./data/' + site,
					];
				},
				throbber: true,
			},
			{
				label: 'parsing xml',
				path: './bin/parse_xml.js',
				argv: function( site )
				{
					return [
						'--src=./data/' + site + '/Posts.xml',
					];
				},
			},
			{
				label: 'building an index',
				path: './bin/build_index.js',
			},
		],
	});
});

gulp.task( 'demo', function ()
{
	var searcher = require( './src/search.js' );

	var index = require( './data/hermeneutics/hermeneutics-index.json' );

	console.log( searcher( 'matt 5', index ) );
});
