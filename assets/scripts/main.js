const bookSelect = document.getElementById("book-select");
const chapterSelect = document.getElementById("chapter-select");
const verseContainer = document.getElementById("verse-container");
const modal = document.getElementById("strongs-modal");
const modalKey = document.getElementById("modal-key");
const modalBody = document.getElementById("modal-body");
const closeModalButton = document.querySelector(".close-button");
const themeToggle = document.getElementById("theme-toggle");
const sunIcon = document.querySelector(".sun-icon");
const moonIcon = document.querySelector(".moon-icon");
const searchInput = document.getElementById("search-input");
const searchResultsContainer = document.getElementById(
  "search-results-container"
);

const bookMap = {
  1: "Genesis",
  2: "Exodus",
  3: "Leviticus",
  4: "Numbers",
  5: "Deuteronomy",
  6: "Joshua",
  7: "Judges",
  8: "Ruth",
  9: "1 Samuel",
  10: "2 Samuel",
  11: "1 Kings",
  12: "2 Kings",
  13: "1 Chronicles",
  14: "2 Chronicles",
  15: "Ezra",
  16: "Nehemiah",
  17: "Esther",
  18: "Job",
  19: "Psalms",
  20: "Proverbs",
  21: "Ecclesiastes",
  22: "Song of Solomon",
  23: "Isaiah",
  24: "Jeremiah",
  25: "Lamentations",
  26: "Ezekiel",
  27: "Daniel",
  28: "Hosea",
  29: "Joel",
  30: "Amos",
  31: "Obadiah",
  32: "Jonah",
  33: "Micah",
  34: "Nahum",
  35: "Habakkuk",
  36: "Zephaniah",
  37: "Haggai",
  38: "Zechariah",
  39: "Malachi",
  40: "Matthew",
  41: "Mark",
  42: "Luke",
  43: "John",
  44: "Acts",
  45: "Romans",
  46: "1 Corinthians",
  47: "2 Corinthians",
  48: "Galatians",
  49: "Ephesians",
  50: "Philippians",
  51: "Colossians",
  52: "1 Thessalonians",
  53: "2 Thessalonians",
  54: "1 Timothy",
  55: "2 Timothy",
  56: "Titus",
  57: "Philemon",
  58: "Hebrews",
  59: "James",
  60: "1 Peter",
  61: "2 Peter",
  62: "1 John",
  63: "2 John",
  64: "3 John",
  65: "Jude",
  66: "Revelation",
};

let dbService = null;
let dbReady = false;
let worker = null;
let modalOpen = false;
let currentBook = null;
let currentChapter = null;
let chaptersInCurrentBook = [];
let navigationControls = null;
let isNavigatingBook = false;
let isReferenceSearch = false;
let isVerseNavigation = false;
let targetChapter = null;
let targetVerse = null;
let searchTimeout = null;

const lastBookId = Math.max(...Object.keys(bookMap).map(Number));

const CACHE_NAME = "concordance-cache-v1";

function populateBookSelect() {
  bookSelect.innerHTML = '<option value="">Select a Book</option>';
  for (const [number, name] of Object.entries(bookMap)) {
    const option = document.createElement("option");
    option.value = number;
    option.textContent = name;
    bookSelect.appendChild(option);
  }
  bookSelect.disabled = false;
  verseContainer.style.display = "none";
  if (navigationControls) navigationControls.remove();
}

function populateChapterSelect(chapters) {
  chapterSelect.innerHTML = '<option value="">Select a Chapter</option>';
  if (chapters && chapters.length > 0) {
    chaptersInCurrentBook = chapters;
    chapters.forEach((chapterNum) => {
      const option = document.createElement("option");
      option.value = chapterNum;
      option.textContent = chapterNum;
      chapterSelect.appendChild(option);
    });
    chapterSelect.disabled = false;
  } else {
    chapterSelect.innerHTML = '<option value="">No Chapters</option>';
    chapterSelect.disabled = true;
    chaptersInCurrentBook = [];
  }
}

function displayVerses(verses) {
  verseContainer.innerHTML = "";

  if (!verses || verses.length === 0) {
    verseContainer.style.display = "none";
    if (navigationControls) navigationControls.remove();
    return;
  }

  verseContainer.style.display = "block";

  verses.forEach((v) => {
    const verseDiv = document.createElement("div");
    verseDiv.className = "verse";
    verseDiv.id = `verse-${v.verse}`;

    const verseNumSpan = document.createElement("span");
    verseNumSpan.className = "verse-number";
    verseNumSpan.textContent = v.verse;
    verseDiv.appendChild(verseNumSpan);

    const verseTextSpan = document.createElement("span");
    verseTextSpan.className = "verse-text";
    verseTextSpan.innerHTML = formatVerseText(v.text);
    verseDiv.appendChild(verseTextSpan);

    verseContainer.appendChild(verseDiv);
  });

  addStrongsClickListeners();
  createNavigationButtons();

  // If we're navigating to a specific verse, scroll to it
  if (isVerseNavigation && targetVerse) {
    setTimeout(() => {
      const verseElement = document.getElementById(`verse-${targetVerse}`);
      if (verseElement) {
        verseElement.scrollIntoView({ behavior: "smooth", block: "center" });
        verseElement.classList.add("highlight-verse");
        setTimeout(() => {
          verseElement.classList.remove("highlight-verse");
        }, 3000);
      }
      isVerseNavigation = false;
      targetVerse = null;
    }, 300);
  }
}

function formatVerseText(text) {
  const wordAndStrongsRegex = /([\w'-]+)((?:\{.*?\})+)/g;

  return text.replace(wordAndStrongsRegex, (match, word, allBraceGroups) => {
    const validStrongsKeyRegex = /(?<!\()\{([GH]\d+)\}(?!\))/g;
    const validStrongsNumbers = [];
    let execMatch;

    while ((execMatch = validStrongsKeyRegex.exec(allBraceGroups)) !== null) {
      validStrongsNumbers.push(execMatch[1]);
    }

    if (validStrongsNumbers.length === 0) {
      return match;
    }

    let resultHtml = `<span class="strongs-word" data-strongs="${validStrongsNumbers[0]}">${word}</span>`;
    for (let i = 1; i < validStrongsNumbers.length; i++) {
      resultHtml += `<span class="strongs-word super-script" data-strongs="${validStrongsNumbers[i]}">${i}</span>`;
    }
    return resultHtml;
  });
}

function addStrongsClickListeners() {
  const strongsWords = verseContainer.querySelectorAll(".strongs-word");
  strongsWords.forEach((span) => {
    span.addEventListener("click", handleStrongsClick);
  });
}

function handleStrongsClick(event) {
  event.stopPropagation();
  const key = event.target.dataset.strongs;
  if (key && dbService && dbReady && !modalOpen) {
    modalOpen = true;
    document.body.classList.add("modal-open");

    dbService
      .getStrongsInfo(key)
      .then((data) => {
        showStrongsModal(data);
      })
      .catch((error) => {
        showGenericError(error);
        hideStrongsModal();
      });
  }
}

function showStrongsModal(data) {
  if (!data) {
    hideStrongsModal();
    return;
  }

  let key = `${data.key} - ${data.lemma || ""}`;

  if (data.xlit) {
    key += ` (${data.xlit})`;
  }

  let bodyHtml = "";
  if (data.pron)
    bodyHtml += `<p><strong>Pronunciation:</strong> ${data.pron}</p>`;
  if (data.translit)
    bodyHtml += `<p><strong>Transliteration:</strong> ${data.translit}</p>`;
  if (data.derivation)
    bodyHtml += `<p><strong>Derivation:</strong> ${data.derivation}</p>`;
  if (data.strongs_def)
    bodyHtml += `<p><strong>Strongs Def:</strong> ${data.strongs_def}</p>`;
  if (data.kjv_def)
    bodyHtml += `<p><strong>KJV Usage:</strong> ${data.kjv_def}</p>`;

  modalKey.textContent = key;
  modalBody.innerHTML = bodyHtml || "<p>No details available.</p>";

  modal.classList.add("open");

  modal.removeEventListener("click", modalBackgroundClickHandler);
  closeModalButton.removeEventListener("click", modalBackgroundClickHandler);
  setTimeout(() => {
    modal.addEventListener("click", modalBackgroundClickHandler);
    closeModalButton.addEventListener("click", modalBackgroundClickHandler);
  }, 100);
}

function hideStrongsModal() {
  modal.removeEventListener("click", modalBackgroundClickHandler);
  closeModalButton.removeEventListener("click", modalBackgroundClickHandler);

  modal.classList.remove("open");
  document.body.classList.remove("modal-open");

  setTimeout(() => {
    if (!modal.classList.contains("open")) {
      modalKey.textContent = "";
      modalBody.innerHTML = "";
      modalOpen = false;
    }
  }, 300);
}

function modalBackgroundClickHandler(event) {
  if (event.target === modal || event.target === closeModalButton) {
    hideStrongsModal();
  }
}

function createNavigationButtons() {
  if (navigationControls) {
    navigationControls.remove();
  }

  navigationControls = document.createElement("div");
  navigationControls.className = "navigation-controls";

  const backButton = document.createElement("button");
  backButton.className = "nav-button back-button";
  backButton.innerHTML = "← Previous Chapter";
  backButton.addEventListener("click", navigateToPreviousChapter);

  const forwardButton = document.createElement("button");
  forwardButton.className = "nav-button forward-button";
  forwardButton.innerHTML = "Next Chapter →";
  forwardButton.addEventListener("click", navigateToNextChapter);

  navigationControls.appendChild(backButton);
  navigationControls.appendChild(forwardButton);

  verseContainer.appendChild(navigationControls);

  updateNavigationButtonsState(backButton, forwardButton);
}

function updateNavigationButtonsState(backButton, forwardButton) {
  const isFirstPossibleChapter =
    parseInt(currentBook) === 1 && parseInt(currentChapter) === 1;
  const isLastPossibleChapter =
    parseInt(currentBook) === lastBookId &&
    chaptersInCurrentBook.length > 0 &&
    parseInt(currentChapter) ===
      chaptersInCurrentBook[chaptersInCurrentBook.length - 1];

  backButton.disabled = isFirstPossibleChapter;
  backButton.classList.toggle("disabled", isFirstPossibleChapter);

  forwardButton.disabled = isLastPossibleChapter;
  forwardButton.classList.toggle("disabled", isLastPossibleChapter);
}

function navigateToPreviousChapter() {
  if (parseInt(currentBook) === 1 && parseInt(currentChapter) === 1) return;

  let targetBook = parseInt(currentBook);
  let targetChapter = parseInt(currentChapter);

  if (targetChapter > 1) {
    // Go to previous chapter in the same book
    targetChapter--;
    chapterSelect.value = targetChapter;
    currentChapter = targetChapter;
    window.scrollTo({ top: 0, behavior: "smooth" });
    fetchVerses(targetBook, targetChapter);
  } else {
    // Go to the last chapter of the previous book
    if (targetBook > 1) {
      targetBook--;
      bookSelect.value = targetBook;
      currentBook = targetBook;
      currentChapter = null;
      isNavigatingBook = true;
      window.scrollTo({ top: 0, behavior: "smooth" });
      // Fetch chapters for the previous book
      worker.postMessage({
        type: "getChapters",
        payload: { book: targetBook },
      });
    }
  }
}

function navigateToNextChapter() {
  if (!chaptersInCurrentBook.length) return;
  const lastChapterInBook =
    chaptersInCurrentBook[chaptersInCurrentBook.length - 1];
  if (
    parseInt(currentBook) === lastBookId &&
    parseInt(currentChapter) === lastChapterInBook
  )
    return;

  let targetBook = parseInt(currentBook);
  let targetChapter = parseInt(currentChapter);

  // Find the index of the current chapter
  const currentChapterIndex = chaptersInCurrentBook.indexOf(targetChapter);

  if (
    currentChapterIndex !== -1 &&
    currentChapterIndex < chaptersInCurrentBook.length - 1
  ) {
    // Go to next chapter in the same book
    targetChapter = chaptersInCurrentBook[currentChapterIndex + 1];
    chapterSelect.value = targetChapter;
    currentChapter = targetChapter;
    window.scrollTo({ top: 0, behavior: "smooth" });
    fetchVerses(targetBook, targetChapter);
  } else {
    // Go to the first chapter of the next book
    if (targetBook < lastBookId) {
      targetBook++;
      bookSelect.value = targetBook;
      currentBook = targetBook;
      currentChapter = null;
      isNavigatingBook = true;
      window.scrollTo({ top: 0, behavior: "smooth" });
      // Fetch chapters for the next book;
      worker.postMessage({
        type: "getChapters",
        payload: { book: targetBook },
      });
    }
  }
}

function fetchChapters(book) {
  if (dbService && dbReady && book) {
    dbService
      .getChapters(book)
      .then((chapters) => {
        populateChapterSelect(chapters);

        // Auto-select chapter if needed
        if (chapters && chapters.length > 0) {
          let chapterToSelect = null;

          if (isVerseNavigation || isReferenceSearch) {
            // For verse navigation or reference search, try to select the target chapter
            if (chapters.includes(targetChapter)) {
              chapterToSelect = targetChapter;
            } else {
              // If specified chapter doesn't exist, select the first one
              chapterToSelect = chapters[0];
            }

            if (isReferenceSearch) {
              isReferenceSearch = false;
            }
          } else if (
            currentChapter === null ||
            !chaptersInCurrentBook.includes(parseInt(currentChapter))
          ) {
            if (isNavigatingBook) {
              if (parseInt(bookSelect.value) > parseInt(currentBook)) {
                // Navigated forward, select first chapter
                chapterToSelect = chapters[0];
              } else {
                // Navigated backward, select last chapter
                chapterToSelect = chapters[chapters.length - 1];
              }
            } else {
              // Came from manual book selection, select first chapter
              chapterToSelect = chapters[0];
            }
          }

          isNavigatingBook = false;

          if (chapterToSelect !== null) {
            chapterSelect.value = chapterToSelect;
            currentChapter = chapterToSelect;
            fetchVerses(currentBook, currentChapter);
          }
        } else {
          // No chapters found for this book
          isNavigatingBook = false;
          isVerseNavigation = false;
          verseContainer.style.display = "none";
          if (navigationControls) navigationControls.remove();
        }
      })
      .catch((error) => {
        showGenericError(error);
      });
  } else {
    console.warn(`Fetch chapters called with invalid parameters: Book=${book}`);
    chapterSelect.innerHTML = '<option value="">Select Book First</option>';
    chaptersInCurrentBook = [];
  }
}

function fetchVerses(book, chapter) {
  if (dbService && dbReady && book && chapter) {
    verseContainer.style.display = "none";
    if (navigationControls) navigationControls.remove();

    dbService
      .getVerses(book, chapter)
      .then((verses) => {
        displayVerses(verses);
      })
      .catch((error) => {
        showGenericError(error);
      });
  } else {
    console.warn(
      `Fetch verses called with invalid parameters: Book=${book}, Chapter=${chapter}`
    );
    verseContainer.innerHTML = "";
    verseContainer.style.display = "none";
    if (navigationControls) navigationControls.remove();
  }
}

function showGenericError(error) {
  console.error("An error occurred:", error);
  verseContainer.style.display = "block";
  verseContainer.innerHTML = `<div class="error-message">An error occurred. Please check the console for details.</div>`;
  if (navigationControls) navigationControls.remove();
}

function parseReferenceSearch(query) {
  // Normalize the query by removing spaces and converting to uppercase
  const normalizedQuery = query.toUpperCase().replace(/\s+/g, "");

  // Regular expression to match potential book references
  // This handles formats like "GEN1", "1COR13", "1TIM2"
  const refRegex = /^(\d?\s*[A-Z]+)(\d+)$/;
  const match = normalizedQuery.match(refRegex);

  if (!match) return null;

  const bookPart = match[1].trim();
  const chapterPart = parseInt(match[2], 10);

  if (isNaN(chapterPart) || chapterPart < 1) return null;

  // Now search through the bookMap for matches
  for (const [bookId, bookName] of Object.entries(bookMap)) {
    // Normalize book name for comparison
    const normalizedBookName = bookName.toUpperCase().replace(/\s+/g, "");

    // Try to match the beginning of the book name
    if (
      normalizedBookName.startsWith(bookPart) ||
      normalizedBookName.includes(bookPart) ||
      bookPart.includes(normalizedBookName)
    ) {
      return {
        book: parseInt(bookId),
        chapter: chapterPart,
      };
    }

    // Handle numbered books (1 Corinthians, 2 Peter, etc.)
    if (bookName.match(/^\d\s/)) {
      // Extract the number and the rest of the name
      const bookMatch = bookName.match(/^(\d)\s(.+)$/);
      if (bookMatch) {
        const [_, bookNum, bookText] = bookMatch;
        // Create short name like "1COR" or "2TIM"
        const shortName = bookNum + bookText.substr(0, 3).toUpperCase();

        if (
          bookPart === shortName ||
          bookPart.includes(shortName) ||
          shortName.includes(bookPart)
        ) {
          return {
            book: parseInt(bookId),
            chapter: chapterPart,
          };
        }
      }
    }
  }

  return null;
}

function performTextSearch(query) {
  if (!query || !dbService || !dbReady) return;

  searchResultsContainer.innerHTML =
    '<div class="search-results-header">Searching...</div>';
  searchResultsContainer.style.display = "block";
  verseContainer.style.display = "none";

  dbService
    .searchText(query, 50)
    .then((data) => {
      displaySearchResults(data.results, data.query);
    })
    .catch((error) => {
      showGenericError(error);
    });
}

function displaySearchResults(results, query) {
  searchResultsContainer.innerHTML = "";

  const header = document.createElement("div");
  header.className = "search-results-header";

  if (!results || results.length === 0) {
    header.textContent = `No results found for "${query}"`;
    searchResultsContainer.appendChild(header);
    return;
  }

  header.textContent = `Result${
    results.length === 1 ? "" : "s"
  } for "${query}"`;
  searchResultsContainer.appendChild(header);

  results.forEach((result) => {
    const resultItem = document.createElement("div");
    resultItem.className = "search-result-item";
    resultItem.dataset.book = result.book;
    resultItem.dataset.chapter = result.chapter;
    resultItem.dataset.verse = result.verse;

    const reference = document.createElement("div");
    reference.className = "search-result-ref";
    reference.textContent = `${bookMap[result.book]} ${result.chapter}:${
      result.verse
    }`;

    const text = document.createElement("div");
    text.className = "search-result-text";
    // Remove Strong's numbers from search results text and highlight search terms
    const cleanText = removeStrongsNumbers(result.text);
    text.innerHTML = highlightSearchTerms(cleanText, query);

    resultItem.appendChild(reference);
    resultItem.appendChild(text);

    resultItem.addEventListener("click", () => {
      navigateToVerse(result.book, result.chapter, result.verse);
    });

    searchResultsContainer.appendChild(resultItem);
  });
}

function removeStrongsNumbers(text) {
  // Remove all occurrences of {G####}, {H####}, {(G####)}, {(H####)}, etc.
  return text.replace(/\{(?:\([GH]\d+\)|[GH]\d+)\}/g, "");
}

function highlightSearchTerms(text, query) {
  // Escape special regex characters in the query
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Create a regex that's case insensitive
  const regex = new RegExp(`(${escapedQuery})`, "gi");

  // Replace matches with highlighted spans
  return text.replace(regex, '<span class="highlight">$1</span>');
}

function navigateToVerse(bookId, chapterNum, verseNum) {
  searchResultsContainer.style.display = "none";

  lastSearchQuery = "";

  bookSelect.value = bookId;
  currentBook = parseInt(bookId);

  targetChapter = parseInt(chapterNum);
  targetVerse = parseInt(verseNum);
  isVerseNavigation = true;

  fetchChapters(bookId);
}

function getCurrentTheme() {
  const userPreference = localStorage.getItem("theme");
  if (userPreference) {
    return userPreference;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);

  if (theme === "dark") {
    sunIcon.style.display = "none";
    moonIcon.style.display = "block";
  } else {
    sunIcon.style.display = "block";
    moonIcon.style.display = "none";
  }
}

async function registerWorker() {
  if ("serviceWorker" in navigator) {
    await navigator.serviceWorker.register("service-worker.js");
  }
}

async function preCacheDatabase() {
  if ("serviceWorker" in navigator && "caches" in window) {
    try {
      const version = localStorage.getItem("dbVersion") || "1.0.0";
      const dbUrl = `assets/kjv.sqlite?v=${version}`;

      // Pre-cache the database
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(dbUrl);

      if (!cachedResponse) {
        console.log("pre-caching database for offline use");
        try {
          const response = await fetch(dbUrl);
          if (response.ok) {
            await cache.put(dbUrl, response);
            console.log("database cached successfully");
          }
        } catch (e) {
          console.warn("failed to pre-cache database", e);
        }
      } else {
        console.log("database already cached");
      }
    } catch (e) {
      console.error("error during database pre-caching", e);
    }
  }
}

function initializeDatabase() {
  try {
    dbService = new BibleDatabaseService();

    dbService
      .init()
      .then(() => {
        dbReady = true;
        populateBookSelect();
      })
      .catch((error) => {
        showGenericError(error);
        bookSelect.disabled = true;
        chapterSelect.disabled = true;
        if (navigationControls) navigationControls.remove();
      });
  } catch (error) {
    showGenericError(error);
  }
}

function addEventListeners() {
  bookSelect.addEventListener("change", () => {
    const selectedBook = parseInt(bookSelect.value, 10);
    currentBook = selectedBook;
    currentChapter = null;
    isNavigatingBook = false;
    chapterSelect.innerHTML = '<option value="">Loading Chapters...</option>';
    chapterSelect.disabled = true;
    verseContainer.style.display = "none";
    if (navigationControls) navigationControls.remove();
    if (modalOpen) hideStrongsModal();

    if (selectedBook && dbService && dbReady) {
      fetchChapters(selectedBook);
    } else if (!selectedBook) {
      chapterSelect.innerHTML = '<option value="">Select Book First</option>';
      chaptersInCurrentBook = [];
    }
  });

  chapterSelect.addEventListener("change", () => {
    const selectedBook = parseInt(bookSelect.value, 10);
    const selectedChapter = parseInt(chapterSelect.value, 10);
    verseContainer.style.display = "none";
    if (navigationControls) navigationControls.remove();
    if (modalOpen) hideStrongsModal();

    if (selectedBook && selectedChapter && worker && dbReady) {
      currentBook = selectedBook;
      currentChapter = selectedChapter;
      isNavigatingBook = false;
      window.scrollTo({ top: 0, behavior: "smooth" });
      fetchVerses(selectedBook, selectedChapter);
    } else if (!selectedChapter) {
      currentChapter = null;
    }
  });

  searchInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
      const query = searchInput.value.trim();

      lastSearchQuery = query;

      if (query.length < 2) return;

      if (searchTimeout) clearTimeout(searchTimeout);

      // Set a small delay to prevent immediate searches while typing
      searchTimeout = setTimeout(() => {
        if (query) {
          // First try reference search (e.g., "gen1" or "1cor13")
          const referenceMatch = parseReferenceSearch(query);
          if (referenceMatch) {
            bookSelect.value = referenceMatch.book;
            currentBook = referenceMatch.book;

            targetChapter = referenceMatch.chapter;
            isReferenceSearch = true;

            worker.postMessage({
              type: "getChapters",
              payload: { book: referenceMatch.book },
            });
          } else {
            // If not a reference match, perform a text search
            performTextSearch(query);
            isReferenceSearch = false;
          }
        }
      }, 300);
    }
  });

  addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("open")) {
      hideStrongsModal();
    }
  });

  themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  });

  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    if (!localStorage.getItem("theme")) {
      setTheme(e.matches ? "dark" : "light");
    }
  });
}

async function initialize() {
  await registerWorker();
  await preCacheDatabase();

  initializeDatabase();
  addEventListeners();
  setTheme(getCurrentTheme());

  modal.style.display = "block";
  modal.classList.remove("open");
}

document.addEventListener("DOMContentLoaded", initialize);
