<?php

class DB {

    public function __construct(){
        R::setup(
            constant("DB_URI"), 
            constant("DB_USER"), 
            constant("DB_PASS")
        );
    }

    public function page($book, $chapter, $sn) {
        $book = $this->bookId($book);
        $chapter = $this->chapterId($book, $chapter);

        return [
            "chapter" => $chapter,
            "books" => $this->books(),
            "book" => $this->book($book),
            "chapters" => $this->chapters($book),
            "verses" => $this->verses($book, $chapter),
            "next" => $this->getnext($book, $chapter),
            "prev" => $this->getprev($book, $chapter),
            "commentary" => $this->commentary($book, $chapter),
            "sn" => $sn
        ];
    }

    public function search($query) {
        $response = $this->redirect($query);
        return $response ?
            new Search(true, $response) : 
            new Search(false, $this->easton($query));
    }

    public function analysis($sn) {
        return [
            "links" => $this->strongs_links($sn),
            "words" => $this->strongs($sn),
            "sn" => $sn
        ];
    }

    private function redirect($query) {
        $query = uppercase($query);
        $parts = preg_split('~[A-Z]+\K~', $query);
        $shortName = trim($parts[0]);
        $chapter = trim($parts[1]);
    
        if(!is_numeric($chapter)) return null;
    
        foreach ($this->books()  as $book) {
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

    private function easton($query) {
        $rows = R::getAll(
            "SELECT word, description, 
            MATCH (word, description) AGAINST (:q) AS score 
            FROM easton 
            HAVING score > 1 
            ORDER BY score DESC 
            LIMIT 0, 40",
            [":q" => $query]
        );

        foreach ($rows as &$row) {
            $row["description"] = hilite($row["description"], $query);
        }

        return ["easton" => $rows];
    }

    private function commentary($book, $chapter) {
        return R::find("mhc", "book = :book AND chapter = :chapter", [
            ":book" => $book,
            ":chapter" => $chapter
        ]);
    }

    private function verses($book, $chapter) {
        return R::getAll(
            "SELECT * FROM kjv WHERE book = :book AND chapter = :chapter",
            [
                ":book" => $book,
                ":chapter" => $chapter
            ]
        );
    }

    private function strongs($sn) {
        $sn = uppercase($sn);
        $sn = str_replace("H0", "H", $sn);
        $sn = hasSpace($sn) ? explode(" ", $sn) : [ $sn ];
        return R::find("lexicon", "number IN (" . R::genSlots($sn) . ")", $sn);
    }
    
    private function strongs_links($sn) {
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
            LIMIT 0, 70",
            [":q" => $sn]
        );
    
        $results = [];
    
        foreach ($rows as $row) {
            $exists = array_filter($results, function ($e) use ($row) {
                return $e["book"] == $row["book"]
                    && $e["chapter"] == $row["chapter"];
            });
    
            if (empty($exists)) {
                $id = $row["book"];
                $book = $this->book($id);
                $row["name"] = $book["shortName"];
                $results[] = $row;
            }
        }

        usort($results, function($a, $b) {
            return $a["book"] > $b["book"];
        }); 
    
        return $results;
    }

    private function book($id) {
        foreach ($this->books() as $book) {
            if ($book["id"] == $id) {
                return $book;
            }
        }
    }

    private function chapters($bookid) {
        return range(1, $this->book($bookid)["chapters"]);
    }
    
    private function bookId($book) {
        if ($book < 1) return 1;
        $books = count($this->books());
        return $book > $books ? $books : $book;
    }
    
    private function chapterId($book, $chapter) {
        $book = $this->book($book);
        $chapters = $book["chapters"];
        if ($chapter < 1) return 1;
        return $chapter > $chapters ? $chapters : $chapter;
    }
    
    private function getnext($book, $chapter) {
        $nextbook = $book;
        $nextchapter = $chapter + 1;
        $totalbooks = count($this->books());
        $totalchapters = count($this->chapters($book));
        
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
    
    private function getprev($book, $chapter) {
        $prevbook = $book;
        $prevchapter = $chapter - 1;
        
        if($prevchapter <= 0) {
            $prevbook = $book - 1;
            
            if($prevbook <= 0) {
                return;
            }
    
            $prevchapter = count($this->chapters($prevbook));
        }
    
        return [
            "book" => $prevbook, 
            "chapter" => $prevchapter 
        ];
    }

    private function books() {
        return [
            [
                "id" => 1,
                "chapters" => 50,
                "name" => "Genesis",
                "shortName" => "Gen"
            ],
            [
                "id" => 2,
                "chapters" => 40,
                "name" => "Exodus",
                "shortName" => "Exo"
            ],
            [
                "id" => 3,
                "chapters" => 27,
                "name" => "Leviticus",
                "shortName" => "Lev"
            ],
            [
                "id" => 4,
                "chapters" => 36,
                "name" => "Numbers",
                "shortName" => "Num"
            ],
            [
                "id" => 5,
                "chapters" => 34,
                "name" => "Deuteronomy",
                "shortName" => "Deut"
            ],
            [
                "id" => 6,
                "chapters" => 24,
                "name" => "Joshua",
                "shortName" => "Josh"
            ],
            [
                "id" => 7,
                "chapters" => 21,
                "name" => "Judges",
                "shortName" => "Judg"
            ],
            [
                "id" => 8,
                "chapters" => 4,
                "name" => "Ruth",
                "shortName" => "Ruth"
            ],
            [
                "id" => 9,
                "chapters" => 31,
                "name" => "1 Samuel",
                "shortName" => "1 Sam"
            ],
            [
                "id" => 10,
                "chapters" => 24,
                "name" => "2 Samuel",
                "shortName" => "2 Sam"
            ],
            [
                "id" => 11,
                "chapters" => 22,
                "name" => "1 Kings",
                "shortName" => "1 Kgs"
            ],
            [
                "id" => 12,
                "chapters" => 25,
                "name" => "2 Kings",
                "shortName" => "2 Kgs"
            ],
            [
                "id" => 13,
                "chapters" => 29,
                "name" => "1 Chronicles",
                "shortName" => "1 Chr"
            ],
            [
                "id" => 14,
                "chapters" => 36,
                "name" => "2 Chronicles",
                "shortName" => "2 Chr"
            ],
            [
                "id" => 15,
                "chapters" => 10,
                "name" => "Ezra",
                "shortName" => "Ezra"
            ],
            [
                "id" => 16,
                "chapters" => 13,
                "name" => "Nehemiah",
                "shortName" => "Neh"
            ],
            [
                "id" => 17,
                "chapters" => 10,
                "name" => "Esther",
                "shortName" => "Est"
            ],
            [
                "id" => 18,
                "chapters" => 42,
                "name" => "Job",
                "shortName" => "Job"
            ],
            [
                "id" => 19,
                "chapters" => 150,
                "name" => "Psalms",
                "shortName" => "Ps"
            ],
            [
                "id" => 20,
                "chapters" => 31,
                "name" => "Proverbs",
                "shortName" => "Prov"
            ],
            [
                "id" => 21,
                "chapters" => 12,
                "name" => "Ecclesiastes",
                "shortName" => "Eccl"
            ],
            [
                "id" => 22,
                "chapters" => 8,
                "name" => "Song of Songs",
                "shortName" => "Song"
            ],
            [
                "id" => 23,
                "chapters" => 66,
                "name" => "Isaiah",
                "shortName" => "Isa"
            ],
            [
                "id" => 24,
                "chapters" => 52,
                "name" => "Jeremiah",
                "shortName" => "Jer"
            ],
            [
                "id" => 25,
                "chapters" => 5,
                "name" => "Lamentations",
                "shortName" => "Lam"
            ],
            [
                "id" => 26,
                "chapters" => 48,
                "name" => "Ezekiel",
                "shortName" => "Ezek"
            ],
            [
                "id" => 27,
                "chapters" => 12,
                "name" => "Daniel",
                "shortName" => "Dan"
            ],
            [
                "id" => 28,
                "chapters" => 14,
                "name" => "Hosea",
                "shortName" => "Hos"
            ],
            [
                "id" => 29,
                "chapters" => 3,
                "name" => "Joel",
                "shortName" => "Joel"
            ],
            [
                "id" => 30,
                "chapters" => 9,
                "name" => "Amos",
                "shortName" => "Amos"
            ],
            [
                "id" => 31,
                "chapters" => 1,
                "name" => "Obadiah",
                "shortName" => "Obad"
            ],
            [
                "id" => 32,
                "chapters" => 4,
                "name" => "Jonah",
                "shortName" => "Jon"
            ],
            [
                "id" => 33,
                "chapters" => 7,
                "name" => "Micah",
                "shortName" => "Mic"
            ],
            [
                "id" => 34,
                "chapters" => 3,
                "name" => "Nahum",
                "shortName" => "Nah"
            ],
            [
                "id" => 35,
                "chapters" => 3,
                "name" => "Habakkuk",
                "shortName" => "Hab"
            ],
            [
                "id" => 36,
                "chapters" => 3,
                "name" => "Zephaniah",
                "shortName" => "Zeph"
            ],
            [
                "id" => 37,
                "chapters" => 2,
                "name" => "Haggai",
                "shortName" => "Hag"
            ],
            [
                "id" => 38,
                "chapters" => 14,
                "name" => "Zechariah",
                "shortName" => "Zech"
            ],
            [
                "id" => 39,
                "chapters" => 4,
                "name" => "Malachi",
                "shortName" => "Mal"
            ],
            [
                "id" => 40,
                "chapters" => 28,
                "name" => "Matthew",
                "shortName" => "Matt"
            ],
            [
                "id" => 41,
                "chapters" => 16,
                "name" => "Mark",
                "shortName" => "Mark"
            ],
            [
                "id" => 42,
                "chapters" => 24,
                "name" => "Luke",
                "shortName" => "Luke"
            ],
            [
                "id" => 43,
                "chapters" => 21,
                "name" => "John",
                "shortName" => "John"
            ],
            [
                "id" => 44,
                "chapters" => 28,
                "name" => "Acts",
                "shortName" => "Acts"
            ],
            [
                "id" => 45,
                "chapters" => 16,
                "name" => "Romans",
                "shortName" => "Rom"
            ],
            [
                "id" => 46,
                "chapters" => 16,
                "name" => "1 Corinthians",
                "shortName" => "1 Cor"
            ],
            [
                "id" => 47,
                "chapters" => 13,
                "name" => "2 Corinthians",
                "shortName" => "2 Cor"
            ],
            [
                "id" => 48,
                "chapters" => 6,
                "name" => "Galatians",
                "shortName" => "Gal"
            ],
            [
                "id" => 49,
                "chapters" => 6,
                "name" => "Ephesians",
                "shortName" => "Eph"
            ],
            [
                "id" => 50,
                "chapters" => 4,
                "name" => "Philippians",
                "shortName" => "Phil"
            ],
            [
                "id" => 51,
                "chapters" => 4,
                "name" => "Colossians",
                "shortName" => "Col"
            ],
            [
                "id" => 52,
                "chapters" => 5,
                "name" => "1 Thessalonians",
                "shortName" => "1 Thess"
            ],
            [
                "id" => 53,
                "chapters" => 3,
                "name" => "2 Thessalonians",
                "shortName" => "2 Thess"
            ],
            [
                "id" => 54,
                "chapters" => 6,
                "name" => "1 Timothy",
                "shortName" => "1 Tim"
            ],
            [
                "id" => 55,
                "chapters" => 4,
                "name" => "2 Timothy",
                "shortName" => "2 Tim"
            ],
            [
                "id" => 56,
                "chapters" => 3,
                "name" => "Titus",
                "shortName" => "Titus"
            ],
            [
                "id" => 57,
                "chapters" => 1,
                "name" => "Philemon",
                "shortName" => "Phil"
            ],
            [
                "id" => 58,
                "chapters" => 13,
                "name" => "Hebrews",
                "shortName" => "Heb"
            ],
            [
                "id" => 59,
                "chapters" => 5,
                "name" => "James",
                "shortName" => "Jas"
            ],
            [
                "id" => 60,
                "chapters" => 5,
                "name" => "1 Peter",
                "shortName" => "1 Pet"
            ],
            [
                "id" => 61,
                "chapters" => 3,
                "name" => "2 Peter",
                "shortName" => "2 Pet"
            ],
            [
                "id" => 62,
                "chapters" => 5,
                "name" => "1 John",
                "shortName" => "1 John"
            ],
            [
                "id" => 63,
                "chapters" => 1,
                "name" => "2 John",
                "shortName" => "2 John"
            ],
            [
                "id" => 64,
                "chapters" => 1,
                "name" => "3 John",
                "shortName" => "3 John"
            ],
            [
                "id" => 65,
                "chapters" => 1,
                "name" => "Jude",
                "shortName" => "Jude"
            ],
            [
                "id" => 66,
                "chapters" => 22,
                "name" => "Revelation",
                "shortName" => "Rev"
            ]
        ];
    }
}