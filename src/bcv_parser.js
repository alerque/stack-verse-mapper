var bcv_parser = require( 'bible-passage-reference-parser/js/en_bcv_parser' );
var config = require( '../config.json' );

// Our standard bcv parser;
var bcv = new bcv_parser.bcv_parser;
bcv.include_apocrypha( config.include_apocrypha );
bcv.set_options( config.bcv_options );

module.exports.bcv = bcv;
