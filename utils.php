<?php

function getAbsoluteUrl() {
    $url =  sprintf("%s://%s%s",
        isset($_SERVER["HTTPS"]) ? "https" : "http",
        $_SERVER["HTTP_HOST"],
        $_SERVER["REQUEST_URI"]
    );

    return strtok($url, "?");
}

function hilite($content, $q) {
    $needles = explode(" ", $q);
    $content = stripslashes(strip_tags($content));

    foreach ($needles as $key) {
        $position = stripos($content, $key);
        if(is_invalid($position)) continue;
        $original = substr($content, $position, strlen($key));
        $content = str_replace($original, "<match>" . $original . "</match>", $content);
    }
    
    return str_replace("match>", "mark>", $content); 
}

function startsWith($haystack, $needle) {
    return substr($haystack, 0, strlen($needle)) === $needle;
}

function hasSpace($source) {
    return strpos($source, " ") !== false;
}

function uppercase($source) {
    return strtoupper( trim($source) );
}

function json($data) {
    return json_encode($data, JSON_NUMERIC_CHECK);
}

function is_invalid($value) {
    return !isset($value) || 
    is_null($value) || 
    !is_numeric($value) || 
    $value < 1;
}