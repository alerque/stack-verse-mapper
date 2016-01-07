#!/usr/bin/env node

var xml_file = process.argv[2];
var site = process.argv[3];
var fs = require('fs');
var posts_dump = fs.readFileSync(xml_file, { encoding: 'utf8' });

var xml_parser = require('xml2json');
var posts = xml_parser.toJson(posts_dump, { object: true, coerce: true }).posts.row;

var bcv_parser = require("bible-passage-reference-parser/js/en_bcv_parser").bcv_parser;
var bcv = new bcv_parser;
bcv.include_apocrypha(true);
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

switch (site) {
  case 'hermeneutics':; var referal = "/36"; break;
  case 'christianity':; var referal = "/30"; break;
  case 'judaism':; var referal = "/836"; break;
  case 'islam':; var referal = "/75"; break;
  case 'history':; var referal = "/177"; break;
  case 'skeptics':; var referal = "/933"; break;
}

posts.forEach(function(post) {
  post.PostType = (post.PostTypeId == 1) ? 'q' : 'a';
  var refs = bcv.parse(post.Body);
  refs.parsed_entities().forEach(function(ref) {
    for (var i = ref.start.v; i <= ref.end.v; i++) {
      var osis = ref.start.b + "." + ref.start.c + "." + i;
      var url = "http://" + site + ".stackexchange.com/" + post.PostType + "/" + post.Id + referal;
      console.log(osis, url)
    }
  });
});
