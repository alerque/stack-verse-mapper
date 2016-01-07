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
bcv.set_options({
  consecutive_combination_strategy: "separate",
  osis_compaction_strategy: "bcv",
  book_sequence_strategy: "include",
  invalid_sequence_strategy: "ignore",
  sequence_combination_strategy: "separate",
  punctuation_strategy: "us",
  invalid_passage_strategy: "ignore",
  non_latin_digits_strategy: "ignore",
  passage_existence_strategy: "bcv",
  zero_chapter_strategy: "error",
  zero_verse_strategy: "allow",
  single_chapter_1_strategy: "verse",
  book_alone_strategy: "ignore",
  book_range_strategy: "ignore",
  captive_end_digits_strategy: "delete",
  end_range_digits_strategy: "verse",
  ps151_strategy: "c",
  versification_system: "default",
  case_sensitive: "none"
});

posts.forEach(function(post) {
  var p = bcv.parse(post.body);
  console.log(post.id, p.osis());
});

