var del = require( 'del' );
var Download = require( 'download' );
var fs = require( 'fs' );
var gulp = require( 'gulp' );
var Promise = require( 'bluebird' );
var Zip = require( 'node-7z' );

// Download and extract the site archives
gulp.task( 'download', function()
{
	var sites = [ 'christianity', 'hermeneutics' ];

	// Clean up the previous extractions, except for the archive zips
	var deletion = del( [ 'data/**', '!data', '!data/*.7z' ] );

	// Map the list of sites, downloading the archives if needed, and then unzipping them
	return deletion.then( function()
	{
		return Promise.map( sites, function( site )
		{
			var filename = site + '.stackexchange.com.7z';
			var path = 'data/' + filename;

			return new Promise( function( resolve, reject )
			{
				// Check if the archive has been downloaded
				fs.stat( path, function( err, stats )
				{
					if ( err )
					{
						console.log( 'Downloading ' + filename );
						var downloader = new Download().get( 'https://archive.org/download/stackexchange/' + filename, 'data' );
						resolve( Promise.promisify( downloader.run, { context: downloader } )() );
					}
					else
					{
						resolve();
					}
				});
			}).then( function()
			{
				console.log( 'Unzipping ' + filename );
				return new Zip().extract( path, 'data/' + site );
			});
		});
	} );
});
