#!/usr/bin/env node

var searcher = require( '../src/search.js' );
var site = process.argv[2];
var query = process.argv[3];
var index = require( '../data/' + site + '-index.json' );

console.log( searcher( query, index ) );
