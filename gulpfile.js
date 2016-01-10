var del = require( 'del' );
var gulp = require( 'gulp' );

require( './src/download-task.js' );
require( './src/index-task.js' );

gulp.task( 'default', [ 'index' ] );

gulp.task( 'clean', function ()
{
	return del( ['data/**/*',] );
});
