<?php

require "smarty/Smarty.class.php";
require "flight/Flight.php";
require "app/search.php";
require "app/utils.php";
require "app/rb.php";
require "app/db.php";

Flight::register("db", "DB");

Flight::route("GET /@book:[0-9]+(/@chapter:[0-9]+)(/@sn)", function ($book, $chapter, $sn) {
    $chapter = isset($chapter) ? $chapter : 1;
    $response = Flight::db()->page($book, $chapter, $sn);
    Flight::view()->assign("vbook", $book);
    Flight::view()->assign("vchapter", $chapter);
    Flight::render("home.html", $response);
  }
);

Flight::route("GET /sn/@sn", function ($sn) {
  $response = Flight::db()->analysis($sn);
  Flight::render("analysis.html", $response);
});

Flight::route("GET /search/@q", function ($q) {
  $response = Flight::db()->search($q);
  
  if ($response->redirect()) {
    Flight::json($response->data(), 301);
    return;
  }

  Flight::render("search.html", $response->data());
});

Flight::map("notFound", function() {
  Flight::redirect("/1");
});

Flight::register("view", "Smarty", array(), function ($smarty) {
  $smarty->loadFilter("output", "trimwhitespace");
  $smarty->compile_dir = "smarty/templates_c/";
  $smarty->config_dir = "smarty/config/";
  $smarty->cache_dir = "smarty/cache/";
  $smarty->template_dir = "templates/";
});

Flight::map("render", function ($template, $data) {
  Flight::view()->assign("baseUrl", getBaseUrl());
  Flight::view()->assign("favicon", getFavicon());
  Flight::view()->assign($data);
  Flight::view()->display($template);
});

Flight::start();
