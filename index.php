<?php

require "smarty/Smarty.class.php";
require "flight/Flight.php";
require "rb.php";
require "db.php";

define("APP_URL", getAbsoluteUrl());

Flight::route("GET /", function () {
  $query = Flight::request()->query;
  $book = getbook($query);
  $chapter = getchapter($query);

  Flight::render("home.html", [
    "sn" => $query->sn,
    "book" => $book,
    "books" => books(),
    "chapter" => $chapter,
    "chapters" => chapters($book),
    "verses" => verses($book, $chapter),
    "next" => getnext($book, $chapter),
    "prev" => getprev($book, $chapter)
  ]);
});

Flight::route("GET /sn/@sn", function ($sn) {
  Flight::render("analysis.html", [
    "links" => strongs_links($sn),
    "words" => strongs($sn),
    "sn" => $sn
  ]);
});

Flight::route("GET /search/@q", function ($q) {
  $response = search($q);
  $redirect = isset($response["redirect"]);
  if ($redirect) {
    Flight::halt(301, json($response["redirect"]));
  }

  Flight::render("search.html", $response);
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
