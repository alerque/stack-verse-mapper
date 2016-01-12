#!/usr/bin/env node

var site = process.argv[2];
var query = process.argv[3];
var config = require( '../config.json' );
var searcher = require( '../src/search.js' );
var index = require( '../data/' + site + '-index.json' );

var results = searcher( query, index ).forEach( function( post ) {
  var url = "http://" + site + ".stackexchange.com/" + post.type + "/" + post.id + '/' + config.sites[site].referral;
  console.log( url, post );
});
