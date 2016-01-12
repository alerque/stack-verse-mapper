var del = require( 'del' );
var gulp = require( 'gulp' );

require( './src/download-task.js' );
require( './src/index-task.js' );

gulp.task( 'default', [ 'index' ] );

gulp.task( 'clean', function ()
{
	return del( ['data/**/*',] );
});

gulp.task( 'demo', function ()
{
	var searcher = require( './src/search.js' );

	var index = require( './data/hermeneutics/hermeneutics-index.json' );

	console.log( searcher( 'matt 5', index ) );
});
