<?php

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

function clean_up($params) {
    $content = str_replace(["strong:", "strongMorph:"], "", $params);
    return preg_replace('#<note type="study">(.*?)</note>#', "", $content);
}

function get_analysis ($params) {
    if(!$params) return "";
    $url = constant("BASE_URL") . "sn/" . urlencode($params);
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