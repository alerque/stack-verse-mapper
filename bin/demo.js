#!/usr/bin/env node

/* eslint no-console: 0 */

var _ = require( 'lodash' );
var search = require( '../src/search.js' );

var site = process.argv[2];
var query = process.argv[3];
var index = require( '../data/' + site + '-index.json' );

search.search( query, index ).forEach( function( post )
{
	var url = 'http://' + site + '.stackexchange.com/' + post.type + '/' + post.id;
	var result = `${ url } ${ post.type.toUpperCase() }: ${ post.title }`;
	if ( process.stdout.isTTY )
	{
		result = _.truncate( result, { length: process.stdout.columns } );
	}
	console.log( result );
	console.log( `  SPEC:${ post.SPEC } (${ _.sortBy( post.refs, 'specificity' )[0].osis }) APS:${ post.APS.toFixed( 2 ) } TDRHP:${ post.TDRHP } TDRHS:${ post.TDRHS } TAG:${ post.TAG } QTH:${ post.QTH } FPS:${ post.FPS.toFixed( 2 ) }` );
});
