<?php

R::setup("mysql:host=localhost;dbname=bible","foo","bar");

function search($q) {
    $redirect = IdRedirect($q);

    if($redirect) {
        return [
            "redirect" => $redirect
        ];
    }

    return [
        "easton" => easton($q)
    ];
}

function IdRedirect($q) {
    $q = uppercase($q);
    $parts = preg_split('~[A-Z]+\K~', $q);
    $shortName = trim($parts[0]);
    $chapter = trim($parts[1]);

    if(!$chapter) return null;

    foreach (books() as $book) {
        $bookName = uppercase($book["name"]);
        $bookName = str_replace(" ", "", $bookName);

        if (startsWith($bookName, $shortName)) {
            return [
                "book" => $book["id"],
                "chapter" => $chapter
            ];
        }
    }

    return null;
}

function verses($book, $chapter) {
    return R::getAll(
        "SELECT * FROM kjv WHERE book = :book AND chapter = :chapter",
        [
            ":book" => $book,
            ":chapter" => $chapter
        ]
    );
}

function strongs($sn) {
    $sn = uppercase($sn);
    $sn = str_replace("H0", "H", $sn);
    $sn = hasSpace($sn) ? explode(" ", $sn) : [ $sn ];
    return R::find( "lexicon", " number IN (" . R::genSlots($sn) . ")", $sn);
}

function strongs_links($sn) {
    $sn = uppercase($sn);
    $sn = explode(" ", $sn);
    $sn = substr_replace($sn, "strong:", 0, 0);
    $sn = implode(" ", $sn);

    $rows = R::getAll(
        "SELECT book, chapter, 
        MATCH (text) AGAINST (:q) AS score 
        FROM kjv 
        HAVING score > 1 
        ORDER BY score DESC 
        LIMIT 0, 40",
        [":q" => $sn]
    );

    $results = [];

    foreach ($rows as $row) {
        $exists = array_filter($results, function ($e) use ($row) {
            return $e["book"] == $row["book"]
                && $e["chapter"] == $row["chapter"];
        });

        if (empty($exists)) {
            $results[] = $row;
        }
    }

    return $results;
}

function easton($q) {
    $rows = R::getAll(
        "SELECT word, description, 
        MATCH (word, description) AGAINST (:q) AS score 
        FROM easton 
        HAVING score > 1 
        ORDER BY score DESC 
        LIMIT 1, 12",
        [":q" => $q]
    );

    foreach ($rows as & $row ) {
        $row["description"] = hilite($row["description"], $q);
    }

    return $rows;
}

function books() {
    return [
        [
            "id" => 1,
            "chapters" => 50,
            "name" => "Genesis"
        ],
        [
            "id" => 2,
            "chapters" => 40,
            "name" => "Exodus"
        ],
        [
            "id" => 3,
            "chapters" => 27,
            "name" => "Leviticus"
        ],
        [
            "id" => 4,
            "chapters" => 36,
            "name" => "Numbers"
        ],
        [
            "id" => 5,
            "chapters" => 34,
            "name" => "Deuteronomy"
        ],
        [
            "id" => 6,
            "chapters" => 24,
            "name" => "Joshua"
        ],
        [
            "id" => 7,
            "chapters" => 21,
            "name" => "Judges"
        ],
        [
            "id" => 8,
            "chapters" => 4,
            "name" => "Ruth"
        ],
        [
            "id" => 9,
            "chapters" => 31,
            "name" => "1 Samuel"
        ],
        [
            "id" => 10,
            "chapters" => 24,
            "name" => "2 Samuel"
        ],
        [
            "id" => 11,
            "chapters" => 22,
            "name" => "1 Kings"
        ],
        [
            "id" => 12,
            "chapters" => 25,
            "name" => "2 Kings"
        ],
        [
            "id" => 13,
            "chapters" => 29,
            "name" => "1 Chronicles"
        ],
        [
            "id" => 14,
            "chapters" => 36,
            "name" => "2 Chronicles"
        ],
        [
            "id" => 15,
            "chapters" => 10,
            "name" => "Ezra"
        ],
        [
            "id" => 16,
            "chapters" => 13,
            "name" => "Nehemiah"
        ],
        [
            "id" => 17,
            "chapters" => 10,
            "name" => "Esther"
        ],
        [
            "id" => 18,
            "chapters" => 42,
            "name" => "Job"
        ],
        [
            "id" => 19,
            "chapters" => 150,
            "name" => "Psalms"
        ],
        [
            "id" => 20,
            "chapters" => 31,
            "name" => "Proverbs"
        ],
        [
            "id" => 21,
            "chapters" => 12,
            "name" => "Ecclesiastes"
        ],
        [
            "id" => 22,
            "chapters" => 8,
            "name" => "Song of Songs"
        ],
        [
            "id" => 23,
            "chapters" => 66,
            "name" => "Isaiah"
        ],
        [
            "id" => 24,
            "chapters" => 52,
            "name" => "Jeremiah"
        ],
        [
            "id" => 25,
            "chapters" => 5,
            "name" => "Lamentations"
        ],
        [
            "id" => 26,
            "chapters" => 48,
            "name" => "Ezekiel"
        ],
        [
            "id" => 27,
            "chapters" => 12,
            "name" => "Daniel"
        ],
        [
            "id" => 28,
            "chapters" => 14,
            "name" => "Hosea"
        ],
        [
            "id" => 29,
            "chapters" => 3,
            "name" => "Joel"
        ],
        [
            "id" => 30,
            "chapters" => 9,
            "name" => "Amos"
        ],
        [
            "id" => 31,
            "chapters" => 1,
            "name" => "Obadiah"
        ],
        [
            "id" => 32,
            "chapters" => 4,
            "name" => "Jonah"
        ],
        [
            "id" => 33,
            "chapters" => 7,
            "name" => "Micah"
        ],
        [
            "id" => 34,
            "chapters" => 3,
            "name" => "Nahum"
        ],
        [
            "id" => 35,
            "chapters" => 3,
            "name" => "Habakkuk"
        ],
        [
            "id" => 36,
            "chapters" => 3,
            "name" => "Zephaniah"
        ],
        [
            "id" => 37,
            "chapters" => 2,
            "name" => "Haggai"
        ],
        [
            "id" => 38,
            "chapters" => 14,
            "name" => "Zechariah"
        ],
        [
            "id" => 39,
            "chapters" => 4,
            "name" => "Malachi"
        ],
        [
            "id" => 40,
            "chapters" => 28,
            "name" => "Matthew"
        ],
        [
            "id" => 41,
            "chapters" => 16,
            "name" => "Mark"
        ],
        [
            "id" => 42,
            "chapters" => 24,
            "name" => "Luke"
        ],
        [
            "id" => 43,
            "chapters" => 21,
            "name" => "John"
        ],
        [
            "id" => 44,
            "chapters" => 28,
            "name" => "Acts"
        ],
        [
            "id" => 45,
            "chapters" => 16,
            "name" => "Romans"
        ],
        [
            "id" => 46,
            "chapters" => 16,
            "name" => "1 Corinthians"
        ],
        [
            "id" => 47,
            "chapters" => 13,
            "name" => "2 Corinthians"
        ],
        [
            "id" => 48,
            "chapters" => 6,
            "name" => "Galatians"
        ],
        [
            "id" => 49,
            "chapters" => 6,
            "name" => "Ephesians"
        ],
        [
            "id" => 50,
            "chapters" => 4,
            "name" => "Philippians"
        ],
        [
            "id" => 51,
            "chapters" => 4,
            "name" => "Colossians"
        ],
        [
            "id" => 52,
            "chapters" => 5,
            "name" => "1 Thessalonians"
        ],
        [
            "id" => 53,
            "chapters" => 3,
            "name" => "2 Thessalonians"
        ],
        [
            "id" => 54,
            "chapters" => 6,
            "name" => "1 Timothy"
        ],
        [
            "id" => 55,
            "chapters" => 4,
            "name" => "2 Timothy"
        ],
        [
            "id" => 56,
            "chapters" => 3,
            "name" => "Titus"
        ],
        [
            "id" => 57,
            "chapters" => 1,
            "name" => "Philemon"
        ],
        [
            "id" => 58,
            "chapters" => 13,
            "name" => "Hebrews"
        ],
        [
            "id" => 59,
            "chapters" => 5,
            "name" => "James"
        ],
        [
            "id" => 60,
            "chapters" => 5,
            "name" => "1 Peter"
        ],
        [
            "id" => 61,
            "chapters" => 3,
            "name" => "2 Peter"
        ],
        [
            "id" => 62,
            "chapters" => 5,
            "name" => "1 John"
        ],
        [
            "id" => 63,
            "chapters" => 1,
            "name" => "2 John"
        ],
        [
            "id" => 64,
            "chapters" => 1,
            "name" => "3 John"
        ],
        [
            "id" => 65,
            "chapters" => 1,
            "name" => "Jude"
        ],
        [
            "id" => 66,
            "chapters" => 22,
            "name" => "Revelation"
        ]
    ];
}

function book($bookid) {
    $books = books();
    foreach ($books as $book) {
        if ($book["id"] == $bookid) {
            return $book;
        }
    }
}

function chapters($bookid) {
    return range(1, book($bookid)["chapters"]);
}

function getbookId($query) {
    $book = $query->book;
    if (is_invalid($book)) return 1;
    $books = count(books());
    return $book > $books ? $books : $book;
}

function getchapterId($query) {
    $book = book($query->book);
    $chapter = $query->chapter;
    $chapters = $book["chapters"];
    if (is_invalid($chapter)) return 1;
    return $chapter > $chapters ? $chapters : $chapter;
}

function getnext($book, $chapter) {
    $nextbook = $book;
    $nextchapter = $chapter + 1;
    $totalbooks = count(books());
    $totalchapters = count(chapters($book));
    
    if($nextchapter > $totalchapters) {
        $nextbook = $book + 1;
        
        if($nextbook > $totalbooks) {
            return;
        }
        
        $nextchapter = 1;
    }

    return [
        "book" => $nextbook, 
        "chapter" => $nextchapter 
    ];
}

function getprev($book, $chapter) {
    $prevbook = $book;
    $prevchapter = $chapter - 1;
    
    if($prevchapter <= 0) {
        $prevbook = $book - 1;
        
        if($prevbook <= 0) {
            return;
        }

        $prevchapter = count(chapters($prevbook));
    }

    return [
        "book" => $prevbook, 
        "chapter" => $prevchapter 
    ];
}


// Smarty functions

function name($params) {
    return book($params)["name"];
}

function remove_prefix($params) {
    return str_replace(["strong:", "strongMorph:"], "", $params);
}

function site_url($params, $uri) {
    return getAbsoluteUrl() . $uri . urlencode($params);
}

function nav_url($params) {
    return sprintf("?book=%d&chapter=%d", $params["book"], $params["chapter"]);
}