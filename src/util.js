// Utilities

var child_process = require( 'child_process' );
var fs = require( 'fs' );
var multimeter = require( 'multimeter-stack' );
var Promise = require( 'bluebird' );
var through = require( 'through2' );

// Run a series of tasks in parallel for each site, returning a promise
/*
	options = {
		sites: [ 'christianity', 'hermeneutics' ],
		src: // function which takes a site name a returns a path for the source Posts.xml file
		dest: // function which takes a site name a returns a path for the destination index.json file
		tasks: [ { // An array of paths, which will be forked, and then piped together
			path: './bin/parse_xml.js',
			label: 'downloading',
		]
	}
*/
module.exports.run_tasks = function( options )
{
	var multi = multimeter( process );
	var stack;
	return new Promise( function( resolve, reject )
	{
		multi.charm.position( function( x, y )
		{
			stack = multi(x, y, {
				type: 'stack',
				width: 20,
			});
			resolve();
		});
	})
	.then( function()
	{
		return Promise.map( options.sites, function( site )
		{
			return new Promise( function( resolve, reject )
			{
				fs.stat( options.src( site ), function( err, stats )
				{
					// Create the src and dest streams, and call resolve when the dest stream has been written to
					var src_stream = fs.createReadStream( options.src( site ) );
					src_stream.size = err ? 0 : stats.size;

					// Pipe the src stream through each task
					var final_stream = options.tasks.reduce( function( stream, task )
					{
						var child = child_process.fork( task.path, [], { silent: true } );
						child.stderr.pipe( process.stderr );
						stream.pipe( child.stdin );

						// Set up a progress bar
						var bar;
						child.on( 'message', function( msg )
						{
							if ( !bar )
							{
								bar = stack.push( site + ': ' + task.label, 'bar' );
							}
							if ( msg.total )
							{
								bar.percent( parseInt( msg.progress / msg.total * 100 ) );
							}
							else
							{
								bar.percent( parseInt( msg.progress / ( stream.size || 50000000 ) * 100 ) );
							}
						});
						return child.stdout;
					}, src_stream );

					// And deliver it to the dest stream
					var dest_stream = fs.createWriteStream( options.dest( site ) );
					final_stream.pipe( dest_stream );
					dest_stream.on( 'finish', resolve );
				});
			});
		});
	})
	.then( function()
	{
		multi.write( '\n' );
		return multi.destroy();
	});
};

// Create a through stream which will send progress messages to the parent process
module.exports.progress_stream = function( stream )
{
	var progress = 0;
	var handler = through( function( chunk, encoding, callback )
	{
		if ( process.send )
		{
			progress += chunk.length;
			process.send({ progress: progress });
		}
		callback( null, chunk );
	});
	return stream.pipe( handler );
};
