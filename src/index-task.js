var gulp = require( 'gulp' );
var util = require ( './util.js' );

gulp.task( 'index', [], function()
{
	return util.run_tasks({
		sites: [ 'christianity', 'hermeneutics' ],
		src: function( site ) { return './data/' + site + '/Posts.xml'; },
		dest: function( site ) { return './data/' + site + '/' + site + '-index.json'; },
		tasks: [
			{ path: './bin/parse_xml.js', label: 'parsing xml' },
			{ path: './bin/build_index.js', label: 'building an index' },
		],
	});
});
