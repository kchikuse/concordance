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

function getFavicon() {
    return "AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAL3FlAC0vYgIyM+nS9Tau6vb4Mbm3uLK/d7iyv3b4Mbm1Nq7q8jPp0u0vYgIvcWUAAAAAAAAAAAAq7V4AMfOpQDAyJoa09i5leDkzfDd4cn/1dq8/9HWtf/R1rX/1dq8/93hyf/g5M3w09i5lcDImhrHzqUAq7V4AMTLoQDAyJoa19u+s+Dkzv/Q1bP/w8ue/7nChv+yu3P/srtz/7nChv/Dy57/0NWz/+Dkzv/X276zwMiaGsTLoQCwuYAH09i5leDkzv/L0av/usKI/6CrRv+QnSD/jZoY/42aGP+QnSD/oKtG/7rCiP/L0av/4OTO/9PYuZWwuYAHyM+nTODjze7Q1bP/usKI/5aiL/+LmBT/jJkV/4yZFv+MmRb/jJkV/4uYFP+Woi//usKI/9DVs//g483uyM+nTNTZu6rd4cn/w8ue/6CqRv+LmBP/jJkV/4yZFv+MmRb/jJkW/4yZFv+MmRb/i5gT/6CrRv/Dy57/3eHJ/9TZu6rb4Mbl1dq8/7nBhv+RnSH/j5wc/5KeIf+Omxv/kJ0f/5CcHv+PnBz/jpsZ/42aGP+QnSD/ucGG/9XavP/b4Mbl3uLL/Nfbv/+2v3r/jJkW/5+qPf/HzY3/xsyL/8fNjf/DyoX/wciB/7zEd/+ZpDD/jJkW/7a/ev/X27//3uLL/OLm0fz7+/n/1dqr/4yZF/+cqDf/xcyK/8TLh//Fy4n/xMuH/8XMif++xXr/nKc2/42aF//V2qv/+/v5/+Lm0fzd4cnl/////+ns0/+VoSf/jpsa/5CcHv+Nmhj/kZ4h/4+cHP+RnSD/j5wc/4+bG/+VoSj/6ezT///////d4cnl09m5qvj48//8/Pn/s7xm/4qXEv+MmRb/jJkW/4yZFv+MmRb/jJkW/4yZFv+KlxL/s7xm//z8+f/4+PP/09m5qsbNpEzo69ru/////+vt1v+hrED/ipcS/4uYFf+MmRb/jJkW/4uYFf+KlxL/oaxA/+vt1v//////6Ova7sbNpEyvuX8H0ti3lfP17P//////6+3W/7O8Zv+VoSf/jZoY/42aGP+VoSf/s7xm/+vt1v//////8/Xs/9LYt5WvuX8HxMuhAL/HmRrX3L6z8/Xs///////7/Pj/6ezT/9nes//Z3rP/6ezT//v8+P//////8/Xs/9fcvrO/x5kaxMuhAKu1eADGzaQAv8eZGtLYt5Xo69rw+Pn0//7+/v////////////7+/v/4+fT/6Ova8NLYt5W/x5kaxs2kAKu1eAAAAAAAAAAAALzEkwC0vYgIxs2kS9PZuavd4snm4+bS/ePm0v3d4snm09m5q8bNpEu0vYgIvMSTAAAAAAAAAAAA4AcAAMADAACAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIABAADAAwAA4AcAAA==";
}