<?php

R::setup("sqlite:bible.sqlite");

function verses($book, $chapter)
{
    return R::getAll(
        "SELECT * FROM kjv WHERE book = :book AND chapter = :chapter",
        array(
            ":book" => $book,
            ":chapter" => $chapter
        )
    );
}

function strongs($sn)
{
    $sn = str_replace("H0", "H", $sn);

    return R::getAll(
        "SELECT * FROM lexicon WHERE number = :sn",
        array(
            ":sn" => $sn
        )
    );
}

function books()
{
    return [
        array(
            "id" => 1,
            "chapters" => 50,
            "name" => "Genesis"
        ),
        array(
            "id" => 2,
            "chapters" => 40,
            "name" => "Exodus"
        ),
        array(
            "id" => 3,
            "chapters" => 27,
            "name" => "Leviticus"
        ),
        array(
            "id" => 4,
            "chapters" => 36,
            "name" => "Numbers"
        ),
        array(
            "id" => 5,
            "chapters" => 34,
            "name" => "Deuteronomy"
        ),
        array(
            "id" => 6,
            "chapters" => 24,
            "name" => "Joshua"
        ),
        array(
            "id" => 7,
            "chapters" => 21,
            "name" => "Judges"
        ),
        array(
            "id" => 8,
            "chapters" => 4,
            "name" => "Ruth"
        ),
        array(
            "id" => 9,
            "chapters" => 31,
            "name" => "1 Samuel"
        ),
        array(
            "id" => 10,
            "chapters" => 24,
            "name" => "2 Samuel"
        ),
        array(
            "id" => 11,
            "chapters" => 22,
            "name" => "1 Kings"
        ),
        array(
            "id" => 12,
            "chapters" => 25,
            "name" => "2 Kings"
        ),
        array(
            "id" => 13,
            "chapters" => 29,
            "name" => "1 Chronicles"
        ),
        array(
            "id" => 14,
            "chapters" => 36,
            "name" => "2 Chronicles"
        ),
        array(
            "id" => 15,
            "chapters" => 10,
            "name" => "Ezra"
        ),
        array(
            "id" => 16,
            "chapters" => 13,
            "name" => "Nehemiah"
        ),
        array(
            "id" => 17,
            "chapters" => 10,
            "name" => "Esther"
        ),
        array(
            "id" => 18,
            "chapters" => 42,
            "name" => "Job"
        ),
        array(
            "id" => 19,
            "chapters" => 150,
            "name" => "Psalms"
        ),
        array(
            "id" => 20,
            "chapters" => 31,
            "name" => "Proverbs"
        ),
        array(
            "id" => 21,
            "chapters" => 12,
            "name" => "Ecclesiastes"
        ),
        array(
            "id" => 22,
            "chapters" => 8,
            "name" => "Song of songs"
        ),
        array(
            "id" => 23,
            "chapters" => 66,
            "name" => "Isaiah"
        ),
        array(
            "id" => 24,
            "chapters" => 52,
            "name" => "Jeremiah"
        ),
        array(
            "id" => 25,
            "chapters" => 5,
            "name" => "Lamentations"
        ),
        array(
            "id" => 26,
            "chapters" => 48,
            "name" => "Ezekiel"
        ),
        array(
            "id" => 27,
            "chapters" => 12,
            "name" => "Daniel"
        ),
        array(
            "id" => 28,
            "chapters" => 14,
            "name" => "Hosea"
        ),
        array(
            "id" => 29,
            "chapters" => 3,
            "name" => "Joel"
        ),
        array(
            "id" => 30,
            "chapters" => 9,
            "name" => "Amos"
        ),
        array(
            "id" => 31,
            "chapters" => 1,
            "name" => "Obadiah"
        ),
        array(
            "id" => 32,
            "chapters" => 4,
            "name" => "Jonah"
        ),
        array(
            "id" => 33,
            "chapters" => 7,
            "name" => "Micah"
        ),
        array(
            "id" => 34,
            "chapters" => 3,
            "name" => "Nahum"
        ),
        array(
            "id" => 35,
            "chapters" => 3,
            "name" => "Habakkuk"
        ),
        array(
            "id" => 36,
            "chapters" => 3,
            "name" => "Zephaniah"
        ),
        array(
            "id" => 37,
            "chapters" => 2,
            "name" => "Haggai"
        ),
        array(
            "id" => 38,
            "chapters" => 14,
            "name" => "Zechariah"
        ),
        array(
            "id" => 39,
            "chapters" => 4,
            "name" => "Malachi"
        ),
        array(
            "id" => 40,
            "chapters" => 28,
            "name" => "Matthew"
        ),
        array(
            "id" => 41,
            "chapters" => 16,
            "name" => "Mark"
        ),
        array(
            "id" => 42,
            "chapters" => 24,
            "name" => "Luke"
        ),
        array(
            "id" => 43,
            "chapters" => 21,
            "name" => "John"
        ),
        array(
            "id" => 44,
            "chapters" => 28,
            "name" => "Acts"
        ),
        array(
            "id" => 45,
            "chapters" => 16,
            "name" => "Romans"
        ),
        array(
            "id" => 46,
            "chapters" => 16,
            "name" => "1 Corinthians"
        ),
        array(
            "id" => 47,
            "chapters" => 13,
            "name" => "2 Corinthians"
        ),
        array(
            "id" => 48,
            "chapters" => 6,
            "name" => "Galatians"
        ),
        array(
            "id" => 49,
            "chapters" => 6,
            "name" => "Ephesians"
        ),
        array(
            "id" => 50,
            "chapters" => 4,
            "name" => "Philippians"
        ),
        array(
            "id" => 51,
            "chapters" => 4,
            "name" => "Colossians"
        ),
        array(
            "id" => 52,
            "chapters" => 5,
            "name" => "1 Thessalonians"
        ),
        array(
            "id" => 53,
            "chapters" => 3,
            "name" => "2 Thessalonians"
        ),
        array(
            "id" => 54,
            "chapters" => 6,
            "name" => "1 Timothy"
        ),
        array(
            "id" => 55,
            "chapters" => 4,
            "name" => "2 Timothy"
        ),
        array(
            "id" => 56,
            "chapters" => 3,
            "name" => "Titus"
        ),
        array(
            "id" => 57,
            "chapters" => 1,
            "name" => "Philemon"
        ),
        array(
            "id" => 58,
            "chapters" => 13,
            "name" => "Hebrews"
        ),
        array(
            "id" => 59,
            "chapters" => 5,
            "name" => "James"
        ),
        array(
            "id" => 60,
            "chapters" => 5,
            "name" => "1 Peter"
        ),
        array(
            "id" => 61,
            "chapters" => 3,
            "name" => "2 Peter"
        ),
        array(
            "id" => 62,
            "chapters" => 5,
            "name" => "1 John"
        ),
        array(
            "id" => 63,
            "chapters" => 1,
            "name" => "2 John"
        ),
        array(
            "id" => 64,
            "chapters" => 1,
            "name" => "3 John"
        ),
        array(
            "id" => 65,
            "chapters" => 1,
            "name" => "Jude"
        ),
        array(
            "id" => 66,
            "chapters" => 22,
            "name" => "Revelation"
        )
    ];
}

function chapters($id) {
    $books = books();
    foreach($books as $book) {
        if ($book["id"] == $id) {
            return range(1, $book["chapters"]);
        }
    }
}

function parse($i) {
    if( !isset($i) ||
        is_null($i) ||
        !is_numeric($i) ||
        $i < 1) return 1;

    return $i;
}