<?php

require "smarty/Smarty.class.php";
require "flight/Flight.php";
require "rb.php";
require "db.php";

Flight::route("GET /", function () {
  $book    = getbook(Flight::request()->query);
  $chapter = getchapter(Flight::request()->query);

  Flight::render("home.html", [
    "verses" => verses($book, $chapter),
    "next" => getnext($book, $chapter),
    "prev" => getprev($book, $chapter),
    "chapters" => chapters($book),
    "chapter" => $chapter,
    "book" => book($book),
    "books" => books()
  ]);
});

Flight::route("GET /sn/@sn", function ($sn) {
  Flight::render("analysis.html", ["words" => strongs($sn)]);
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
