<?php

require "smarty/Smarty.class.php";
require "flight/Flight.php";
require "rb.php";
require "db.php";

Flight::route("OPTIONS *", function () {
  Flight::json(array());
});

Flight::route("GET /", function () {
  $book    = parse(Flight::request()->query->book);
  $chapter = parse(Flight::request()->query->chapter);
  
  $verses = verses($book, $chapter);
  $chapters = chapters($book);
  $books = books();

  Flight::render("home.tpl",
    array(
      "chapters" => $chapters,
      "chapter" => $chapter,
      "verses" => $verses,
      "books" => $books,
      "book" => $book
    ));
});

Flight::route("GET /sn/@sn", function ($sn) {
  Flight::json(strongs($sn));
});

Flight::register("view", "Smarty", array(), function($smarty) {
  $smarty->template_dir = "templates/";
  $smarty->compile_dir = "smarty/templates_c/";
  $smarty->config_dir = "smarty/config/";
  $smarty->cache_dir = "smarty/cache/";
  $smarty->debugging = false;
});

Flight::map("render", function($template, $data) {
  Flight::view()->assign($data);
  Flight::view()->display($template);
});

Flight::start();
