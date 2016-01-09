var del = require( 'del' );
var gulp = require( 'gulp' );

require( './src/download-task.js' );

gulp.task( 'default', [ 'process' ] );

gulp.task( 'clean', function ()
{
	return del( ['data/**/*',] );
});

gulp.task( 'process', [ 'download' ], function()
{
	
});
