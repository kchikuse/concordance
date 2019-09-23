<?php

require_once "flight/Flight.php";
require_once "rb.php";
require_once "db.php";

Flight::route("OPTIONS *", function () {
  Flight::json( array() );
});

Flight::route("GET /", function () {
  Flight::render("home.php",
    array(
      "books" => books(),
      "verses" => verses(1, 1)
    )
  );
});

Flight::route("GET /sn/@sn", function ($sn) {
  Flight::json( strongs($sn) );
});

Flight::start();
