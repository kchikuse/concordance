<?php

require "smarty/Smarty.class.php";
require "flight/Flight.php";
require "classes/utils.php";
require "classes/rb.php";
require "classes/db.php";

Flight::register("db", "DB");

Flight::route("GET /", function () {
  $query = Flight::request()->query;
  $response = Flight::db()->page($query);
  Flight::render("home.html", $response);
});

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
