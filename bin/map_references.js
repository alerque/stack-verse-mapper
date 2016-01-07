#!/usr/bin/env node

var xml_file = process.argv[1];

// TODO: parse XML file and iterate through the posts instead of this dummy array
var posts = [
  { id: 0, body: "test Romans 10:4 stuff" },
  { id: 1, body: "test Revalation 7:6-10 stuff" },
  { id: 2, body: "test John 3:16 stuff Romans 3:23 more stuff" }
];

var bcv_parser = require("bible-passage-reference-parser/js/en_bcv_parser").bcv_parser;
var bcv = new bcv_parser;

posts.forEach(function(post) {
  var p = bcv.parse(post.body);
  console.log(post.id, p.osis());
});

