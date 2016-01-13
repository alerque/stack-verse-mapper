var del = require( 'del' );
var gulp = require( 'gulp' );
var config = require( './config.json' );

var task_runner = require( './src/task_runner.js' );

gulp.task( 'demo', function ()
{
	var searcher = require( './src/search.js' ).search;

	var index = require( './data/hermeneutics-index.json' );

	console.log( searcher( 'matt 5', index ) );
});
