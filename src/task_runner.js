// Task runner

var _ = require( 'lodash' );
var child_process = require( 'child_process' );
var clui = require( 'clui' );
var fs = require( 'fs' );
var logUpdate = require( 'log-update' );
var Promise = require( 'bluebird' );
var config = require( '../config.json' );

// Run a series of tasks in parallel for each site, returning a promise
/*
	options = {
		sites: config.sites,
		data: 'data', // path to data folder
		dest: // function which takes a site name a returns a path for the destination index.json file
		tasks: [ {
			label: 'downloading',
			path: './bin/parse_xml.js', // A path to fork to, piping stdin/out
			argv: function(){}, // A function returning a list of arguments to pass to the child process
			throbber: true, // Display a throbber rather than a progress bar
		} ]
	}
*/
module.exports = function( options )
{
	var bars = [];
	var progress = new clui.Progress( 20 );
	var label_width = _.max( config.sites.map( function( site ) { return site.length; } ) ) + _.max( options.tasks.map( function( task ) { return task.label.length; } ) ) + 2;
	var timer = setInterval( function()
	{
		var output = '';
		bars.forEach( function( bar )
		{
			output += new clui.Line()
				.padding( 2 )
				.column( bar.label, label_width )
				.padding( 2 )
				.contents();
			if ( bar.throbber )
			{
				output += bar.active ? 'running' : 'finished';
			}
			if ( bar.total )
			{
				output += progress.update( bar.progress, bar.total );
			}
			output += '\n';
		});
		logUpdate( output );
	}, 50 );
	return Promise.map( config.sites, function( site )
	{
		return new Promise( function( resolve, reject )
		{
			fs.mkdir( options.data + '/' + site, function()
			{
				// Repeat through each task, piping each to the next
				var final_stream = options.tasks.reduce( function( stream, task )
				{
					if ( task.src )
					{
						stream = fs.createReadStream( task.src( site ) );
					}
					// Fork a child process
					var child = child_process.fork( task.path, task.argv ? task.argv( site ) : [], { silent: true } );
					child.stderr.pipe( process.stderr );
					stream.pipe( child.stdin );

					// Set up and update a progress bar
					var bar = { label: site + ': ' + task.label };
					if ( task.throbber )
					{
						bar.throbber = true;
					}
					child.on( 'message', function( msg )
					{
						if ( !bar.active )
						{
							bar.active = true;
							bars.push( bar );
						}
						if ( typeof msg.throbber !== 'undefined' )
						{
							bar.active = msg.throbber;
						}
						else if ( msg.progress )
						{
							bar.progress = msg.progress;
							bar.total = msg.total;
						}
					});
					return child.stdout;
				}, process.stdin );

				// And deliver it to the dest stream
				var dest_stream = fs.createWriteStream( options.dest( site ) );
				final_stream.pipe( dest_stream );
				dest_stream.on( 'finish', resolve );
			});
		});
	})
	.then( function()
	{
		clearInterval( timer );
		logUpdate.done();
		return Promise.resolve();
	});
};
