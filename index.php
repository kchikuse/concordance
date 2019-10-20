<?php

require "smarty/Smarty.class.php";
require "flight/Flight.php";
require "rb.php";
require "db.php";

Flight::route("GET /", function () {
  $query = Flight::request()->query;
  $book = getbook($query);
  $chapter = getchapter($query);

  Flight::render("home.html", [
    "verses" => verses($book, $chapter),
    "next" => getnext($book, $chapter),
    "prev" => getprev($book, $chapter),
    "chapters" => chapters($book),
    "chapter" => $chapter,
    "book" => book($book),
    "books" => books(),
    "sn" => $query->sn
  ]);
});

Flight::route("GET /sn/@sn", function ($sn) {
  Flight::render("analysis.html", [
    "links" => strongs_links($sn),
    "words" => strongs($sn),
    "sn" => $sn
  ]);
});

Flight::route("GET /search/@query", function ($query) {
  Flight::render("search.html", [
    "easton" => easton($query)
  ]);
});

Flight::register("view", "Smarty", array(), function ($smarty) {
  $smarty->loadFilter("output", "trimwhitespace");
  $smarty->template_dir = "templates/";
  $smarty->compile_dir = "smarty/templates_c/";
  $smarty->config_dir = "smarty/config/";
  $smarty->cache_dir = "smarty/cache/";
  $smarty->debugging = false;
});

Flight::map("render", function ($template, $data) {
  Flight::view()->assign($data);
  Flight::view()->display($template);
});

Flight::start();
