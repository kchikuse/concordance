<?php

function getBaseUrl() {
    return sprintf(
        "%s://%s%s/",
        isset($_SERVER["HTTPS"]) ? "https" : "http",
        $_SERVER["SERVER_NAME"],
        dirname($_SERVER["PHP_SELF"])
    );
}

function hilite($content, $q) {
    $needles = explode(" ", $q);
    $content = stripslashes(strip_tags($content));

    foreach ($needles as $key) {
        $position = stripos($content, $key);
        if($position < 1) continue;
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

function remove_prefix($params) {
    return str_replace(["strong:", "strongMorph:"], "", $params);
}

function get_analysis ($params) {
    if(!$params) return "";
    $url = getBaseUrl() . "sn/" . urlencode($params);
    return fetch_url($url);
}

function fetch_url ($url) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $output = curl_exec($ch);
    curl_close($ch);
    return $output;
}
