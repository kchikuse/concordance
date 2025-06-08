// =====================
// CONSTANTS & GLOBALS
// =====================
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

const CACHE_NAME = "concordance-cache-v1";
const LAST_BOOK_ID = Math.max(...Object.keys(bookMap).map(Number));

// =====================
// DOM ELEMENTS
// =====================
const elements = {
  bookSelect: document.getElementById("book-select"),
  chapterSelect: document.getElementById("chapter-select"),
  verseContainer: document.getElementById("verse-container"),
  tooltip: document.getElementById("strongs-tooltip"),
  tooltipContent: document.getElementById("tooltip-content"),
  tooltipCopyButton: document.querySelector(".tooltip-copy-button"),
  themeToggle: document.getElementById("theme-toggle"),
  sunIcon: document.querySelector(".sun-icon"),
  moonIcon: document.querySelector(".moon-icon"),
  searchInput: document.getElementById("search-input"),
  searchResultsContainer: document.getElementById("search-results-container"),
};

// =====================
// APPLICATION STATE
// =====================
const state = {
  db: null,
  dbReady: false,
  tooltipOpen: false,
  currentBook: null,
  currentChapter: null,
  chaptersInCurrentBook: [],
  navigationControls: null,
  isNavigatingBook: false,
  isReferenceSearch: false,
  isVerseNavigation: false,
  targetChapter: null,
  targetVerse: null,
  searchTimeout: null,
};

// =====================
// DATABASE OPERATIONS
// =====================
const Database = {
  async initialize() {
    try {
      state.db = new DatabaseService();
      await state.db.init();
      state.dbReady = true;
      UI.populateBookSelect();
    } catch (error) {
      ErrorHandler.showGenericError(error);
      elements.bookSelect.disabled = true;
      elements.chapterSelect.disabled = true;
      Navigation.removeControls();
    }
  },

  async preCacheDatabase() {
    if ("serviceWorker" in navigator && "caches" in window) {
      try {
        const version = localStorage.getItem("dbVersion") || "1.0.0";
        const dbUrl = `assets/kjv.sqlite?v=${version}`;
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
        }
      } catch (e) {
        console.error("error during database pre-caching", e);
      }
    }
  },

  executeIfReady(operation) {
    if (!state.dbReady || !state.db) {
      return Promise.reject(new Error("Database not ready"));
    }
    return operation();
  },
};

// =====================
// UI COMPONENTS
// =====================
const UI = {
  populateBookSelect() {
    elements.bookSelect.innerHTML = '<option value="">Select a Book</option>';
    for (const [number, name] of Object.entries(bookMap)) {
      const option = document.createElement("option");
      option.value = number;
      option.textContent = name;
      elements.bookSelect.appendChild(option);
    }
    elements.bookSelect.disabled = false;
    elements.verseContainer.style.display = "none";
    Navigation.removeControls();
  },

  populateChapterSelect(chapters) {
    elements.chapterSelect.innerHTML =
      '<option value="">Select a Chapter</option>';
    if (chapters && chapters.length > 0) {
      state.chaptersInCurrentBook = chapters;
      chapters.forEach((chapterNum) => {
        const option = document.createElement("option");
        option.value = chapterNum;
        option.textContent = chapterNum;
        elements.chapterSelect.appendChild(option);
      });
      elements.chapterSelect.disabled = false;
    } else {
      elements.chapterSelect.innerHTML =
        '<option value="">No Chapters</option>';
      elements.chapterSelect.disabled = true;
      state.chaptersInCurrentBook = [];
    }
  },

  displayVerses(verses) {
    elements.verseContainer.innerHTML = "";

    if (!verses || verses.length === 0) {
      elements.verseContainer.style.display = "none";
      Navigation.removeControls();
      return;
    }

    elements.verseContainer.style.display = "block";

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
      verseTextSpan.innerHTML = TextFormatter.formatVerseText(v.text);
      verseDiv.appendChild(verseTextSpan);

      elements.verseContainer.appendChild(verseDiv);
    });

    StrongsHandler.addClickListeners();
    Navigation.createControls();

    // Handle verse navigation scrolling
    if (state.isVerseNavigation && state.targetVerse) {
      setTimeout(() => {
        const verseElement = document.getElementById(
          `verse-${state.targetVerse}`
        );
        if (verseElement) {
          verseElement.scrollIntoView({ behavior: "smooth", block: "center" });
          verseElement.classList.add("highlight-verse");
          setTimeout(() => {
            verseElement.classList.remove("highlight-verse");
          }, 3000);
        }
        state.isVerseNavigation = false;
        state.targetVerse = null;
      }, 300);
    }
  },

  scrollTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  },
};

// =====================
// TEXT FORMATTING
// =====================
const TextFormatter = {
  formatVerseText(text) {
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
  },

  removeStrongsNumbers(text) {
    return text.replace(/\{(?:\([GH]\d+\)|[GH]\d+)\}/g, "");
  },

  highlightSearchTerms(text, query) {
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escapedQuery})`, "gi");
    return text.replace(regex, '<span class="highlight">$1</span>');
  },
};

// =====================
// STRONG'S HANDLER
// =====================
const StrongsHandler = {
  init() {
    elements.tooltipCopyButton.addEventListener("click", (event) => {
      event.stopPropagation();
      this.copyTooltipContent();
    });
  },

  addClickListeners() {
    const strongsWords =
      elements.verseContainer.querySelectorAll(".strongs-word");
    strongsWords.forEach((span) => {
      span.addEventListener("click", this.handleClick);
    });
  },

  handleClick(event) {
    event.stopPropagation();

    if (state.tooltipOpen) {
      StrongsHandler.hideTooltip();
    }

    const key = event.target.dataset.strongs;
    if (key) {
      Database.executeIfReady(() => state.db.getStrongsInfo(key))
        .then((data) => {
          if (data) {
            StrongsHandler.showTooltip(data, event.target);
          }
        })
        .catch((error) => {
          ErrorHandler.showGenericError(error);
          StrongsHandler.hideTooltip();
        });
    }
  },

  showTooltip(data, targetElement) {
    let key = `${data.key} - ${data.lemma || ""}`;
    if (data.xlit) key += ` (${data.xlit})`;

    let bodyHtml = "";
    if (data.pron)
      bodyHtml += `<p><strong>Pronunciation:</strong> ${data.pron}</p>`;
    if (data.derivation)
      bodyHtml += `<p><strong>Derivation:</strong> ${data.derivation}</p>`;
    if (data.strongs_def)
      bodyHtml += `<p><strong>Strongs Def:</strong> ${data.strongs_def}</p>`;
    if (data.kjv_def)
      bodyHtml += `<p><strong>KJV Usage:</strong> ${data.kjv_def}</p>`;

    elements.tooltipContent.innerHTML = `<h3>${key}</h3>${
      bodyHtml || "<p>No details available.</p>"
    }`;

    elements.tooltip.classList.add("visible");
    elements.tooltip.setAttribute("aria-hidden", "false");
    state.tooltipOpen = true;

    this.positionTooltip(targetElement);

    setTimeout(() => {
      document.addEventListener("click", this.hideTooltip, { once: true });
    }, 0);
  },

  async copyTooltipContent() {
    const contentToCopy = elements.tooltipContent.innerText;

    if (!navigator.clipboard) {
      console.error("Clipboard API not available.");
      return;
    }

    try {
      await navigator.clipboard.writeText(contentToCopy);

      // Visual Feedback
      const copyIcon = elements.tooltipCopyButton.querySelector(".copy-icon");
      const checkIcon = elements.tooltipCopyButton.querySelector(".check-icon");

      copyIcon.style.display = "none";
      checkIcon.style.display = "block";

      // Revert the icon back after a short delay
      setTimeout(() => {
        copyIcon.style.display = "block";
        checkIcon.style.display = "none";
      }, 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  },

  positionTooltip(targetElement) {
    const tooltip = elements.tooltip;
    const arrow = tooltip.querySelector(".tooltip-arrow");
    const gap = 10; // Space between word and tooltip

    // Make sure styles are applied before getting dimensions
    tooltip.classList.remove("flipped");

    const targetRect = targetElement.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();

    // 1. Calculate default position (below the word)
    const posBelow = targetRect.bottom + window.scrollY + gap;

    // 2. Calculate flipped position (above the word)
    const posAbove = targetRect.top + window.scrollY - tooltipRect.height - gap;

    let finalTop;

    // 3. Check if default position overflows the bottom of the viewport
    if (posBelow + tooltipRect.height > window.innerHeight + window.scrollY) {
      // It overflows the bottom. Let's try flipping it to the top.
      // 4. Check if the flipped position would be cut off at the top.
      if (posAbove < window.scrollY) {
        // It's also cut off at the top. This is the worst case.
        // Revert to the default bottom position. The user can scroll down to see it.
        finalTop = posBelow;
        tooltip.classList.remove("flipped");
      } else {
        // There's enough space above, so use the flipped position.
        finalTop = posAbove;
        tooltip.classList.add("flipped");
      }
    } else {
      // There's enough space below, so use the default position.
      finalTop = posBelow;
      tooltip.classList.remove("flipped");
    }

    let left =
      targetRect.left +
      window.scrollX +
      targetRect.width / 2 -
      tooltipRect.width / 2;

    // Prevent overflowing the left/right of the viewport
    const margin = 10; // Margin from screen edges
    if (left < margin) {
      left = margin;
    } else if (
      left + tooltipRect.width >
      document.documentElement.clientWidth - margin
    ) {
      left = document.documentElement.clientWidth - tooltipRect.width - margin;
    }

    // Adjust arrow position to stay pointing at the word
    const arrowOffset = targetRect.left + targetRect.width / 2 - left;
    arrow.style.left = `${arrowOffset}px`;

    // Apply the final calculated positions
    tooltip.style.top = `${finalTop}px`;
    tooltip.style.left = `${left}px`;
  },

  hideTooltip() {
    elements.tooltip.classList.remove("visible");
    elements.tooltip.setAttribute("aria-hidden", "true");
    state.tooltipOpen = false;
    document.removeEventListener("click", StrongsHandler.hideTooltip);
  },
};

// =====================
// NAVIGATION
// =====================
const Navigation = {
  createControls() {
    this.removeControls();

    state.navigationControls = document.createElement("div");
    state.navigationControls.className = "navigation-controls";

    const backButton = document.createElement("button");
    backButton.className = "nav-button back-button";
    backButton.innerHTML = "← Previous Chapter";
    backButton.addEventListener("click", () =>
      this.navigateToPreviousChapter()
    );

    const forwardButton = document.createElement("button");
    forwardButton.className = "nav-button forward-button";
    forwardButton.innerHTML = "Next Chapter →";
    forwardButton.addEventListener("click", () => this.navigateToNextChapter());

    state.navigationControls.appendChild(backButton);
    state.navigationControls.appendChild(forwardButton);
    elements.verseContainer.appendChild(state.navigationControls);

    this.updateButtonsState(backButton, forwardButton);
  },

  removeControls() {
    if (state.navigationControls) {
      state.navigationControls.remove();
      state.navigationControls = null;
    }
  },

  updateButtonsState(backButton, forwardButton) {
    const isFirstChapter =
      parseInt(state.currentBook) === 1 && parseInt(state.currentChapter) === 1;
    const isLastChapter =
      parseInt(state.currentBook) === LAST_BOOK_ID &&
      state.chaptersInCurrentBook.length > 0 &&
      parseInt(state.currentChapter) ===
        state.chaptersInCurrentBook[state.chaptersInCurrentBook.length - 1];

    backButton.disabled = isFirstChapter;
    backButton.classList.toggle("disabled", isFirstChapter);
    forwardButton.disabled = isLastChapter;
    forwardButton.classList.toggle("disabled", isLastChapter);
  },

  navigateToPreviousChapter() {
    if (
      parseInt(state.currentBook) === 1 &&
      parseInt(state.currentChapter) === 1
    )
      return;

    let targetBook = parseInt(state.currentBook);
    let targetChapter = parseInt(state.currentChapter);

    if (targetChapter > 1) {
      targetChapter--;
      elements.chapterSelect.value = targetChapter;
      state.currentChapter = targetChapter;
      UI.scrollTop();
      DataFetcher.fetchVerses(targetBook, targetChapter);
    } else if (targetBook > 1) {
      targetBook--;
      elements.bookSelect.value = targetBook;
      state.currentBook = targetBook;
      state.currentChapter = null;
      state.isNavigatingBook = true;
      UI.scrollTop();
      DataFetcher.fetchChapters(targetBook);
    }
  },

  navigateToNextChapter() {
    if (!state.chaptersInCurrentBook.length) return;

    const lastChapterInBook =
      state.chaptersInCurrentBook[state.chaptersInCurrentBook.length - 1];
    if (
      parseInt(state.currentBook) === LAST_BOOK_ID &&
      parseInt(state.currentChapter) === lastChapterInBook
    )
      return;

    let targetBook = parseInt(state.currentBook);
    let targetChapter = parseInt(state.currentChapter);
    const currentChapterIndex =
      state.chaptersInCurrentBook.indexOf(targetChapter);

    if (
      currentChapterIndex !== -1 &&
      currentChapterIndex < state.chaptersInCurrentBook.length - 1
    ) {
      targetChapter = state.chaptersInCurrentBook[currentChapterIndex + 1];
      elements.chapterSelect.value = targetChapter;
      state.currentChapter = targetChapter;
      UI.scrollTop();
      DataFetcher.fetchVerses(targetBook, targetChapter);
    } else if (targetBook < LAST_BOOK_ID) {
      targetBook++;
      elements.bookSelect.value = targetBook;
      state.currentBook = targetBook;
      state.currentChapter = null;
      state.isNavigatingBook = true;
      UI.scrollTop();
      DataFetcher.fetchChapters(targetBook);
    }
  },

  navigateToVerse(bookId, chapterNum, verseNum) {
    elements.searchResultsContainer.style.display = "none";
    elements.bookSelect.value = bookId;
    state.currentBook = parseInt(bookId);
    state.targetChapter = parseInt(chapterNum);
    state.targetVerse = parseInt(verseNum);
    state.isVerseNavigation = true;
    DataFetcher.fetchChapters(bookId);
  },
};

// =====================
// DATA FETCHER
// =====================
const DataFetcher = {
  fetchChapters(book) {
    if (!book) {
      console.warn("Fetch chapters called with invalid book parameter");
      elements.chapterSelect.innerHTML =
        '<option value="">Select Book First</option>';
      state.chaptersInCurrentBook = [];
      return;
    }

    Database.executeIfReady(() => state.db.getChapters(book))
      .then((chapters) => {
        UI.populateChapterSelect(chapters);
        this.handleChapterAutoSelection(chapters);
      })
      .catch((error) => {
        ErrorHandler.showGenericError(error);
      });
  },

  handleChapterAutoSelection(chapters) {
    if (!chapters || chapters.length === 0) {
      state.isNavigatingBook = false;
      state.isVerseNavigation = false;
      elements.verseContainer.style.display = "none";
      Navigation.removeControls();
      return;
    }

    let chapterToSelect = null;

    if (state.isVerseNavigation || state.isReferenceSearch) {
      chapterToSelect = chapters.includes(state.targetChapter)
        ? state.targetChapter
        : chapters[0];
      if (state.isReferenceSearch) state.isReferenceSearch = false;
    } else if (
      state.currentChapter === null ||
      !state.chaptersInCurrentBook.includes(parseInt(state.currentChapter))
    ) {
      if (state.isNavigatingBook) {
        chapterToSelect =
          parseInt(elements.bookSelect.value) > parseInt(state.currentBook)
            ? chapters[0]
            : chapters[chapters.length - 1];
      } else {
        chapterToSelect = chapters[0];
      }
    }

    state.isNavigatingBook = false;

    if (chapterToSelect !== null) {
      elements.chapterSelect.value = chapterToSelect;
      state.currentChapter = chapterToSelect;
      this.fetchVerses(state.currentBook, state.currentChapter);
    }
  },

  fetchVerses(book, chapter) {
    if (!book || !chapter) {
      console.warn(
        `Fetch verses called with invalid parameters: Book=${book}, Chapter=${chapter}`
      );
      elements.verseContainer.innerHTML = "";
      elements.verseContainer.style.display = "none";
      Navigation.removeControls();
      return;
    }

    elements.verseContainer.style.display = "none";
    Navigation.removeControls();

    Database.executeIfReady(() => state.db.getVerses(book, chapter))
      .then((verses) => {
        UI.displayVerses(verses);
      })
      .catch((error) => {
        ErrorHandler.showGenericError(error);
      });
  },
};

// =====================
// SEARCH FUNCTIONALITY
// =====================
const Search = {
  parseReferenceSearch(query) {
    const normalizedQuery = query.toUpperCase().replace(/\s+/g, "");
    const refRegex = /^(\d?\s*[A-Z]+)(\d+)$/;
    const match = normalizedQuery.match(refRegex);

    if (!match) return null;

    const bookPart = match[1].trim();
    const chapterPart = parseInt(match[2], 10);

    if (isNaN(chapterPart) || chapterPart < 1) return null;

    for (const [bookId, bookName] of Object.entries(bookMap)) {
      const normalizedBookName = bookName.toUpperCase().replace(/\s+/g, "");

      if (
        normalizedBookName.startsWith(bookPart) ||
        normalizedBookName.includes(bookPart) ||
        bookPart.includes(normalizedBookName)
      ) {
        return { book: parseInt(bookId), chapter: chapterPart };
      }

      // Handle numbered books
      if (bookName.match(/^\d\s/)) {
        const bookMatch = bookName.match(/^(\d)\s(.+)$/);
        if (bookMatch) {
          const [_, bookNum, bookText] = bookMatch;
          const shortName = bookNum + bookText.substr(0, 3).toUpperCase();
          if (
            bookPart === shortName ||
            bookPart.includes(shortName) ||
            shortName.includes(bookPart)
          ) {
            return { book: parseInt(bookId), chapter: chapterPart };
          }
        }
      }
    }

    return null;
  },

  performTextSearch(query) {
    if (!query) return;

    elements.searchResultsContainer.innerHTML =
      '<div class="search-results-header">Searching...</div>';
    elements.searchResultsContainer.style.display = "block";
    elements.verseContainer.style.display = "none";

    Database.executeIfReady(() => state.db.searchText(query, 50))
      .then((data) => {
        this.displaySearchResults(data.results, data.query);
      })
      .catch((error) => {
        ErrorHandler.showGenericError(error);
      });
  },

  displaySearchResults(results, query) {
    elements.searchResultsContainer.innerHTML = "";

    const header = document.createElement("div");
    header.className = "search-results-header";

    if (!results || results.length === 0) {
      header.textContent = `No results found for "${query}"`;
      elements.searchResultsContainer.appendChild(header);
      return;
    }

    header.textContent = `Result${
      results.length === 1 ? "" : "s"
    } for "${query}"`;
    elements.searchResultsContainer.appendChild(header);

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
      const cleanText = TextFormatter.removeStrongsNumbers(result.text);
      text.innerHTML = TextFormatter.highlightSearchTerms(cleanText, query);

      resultItem.appendChild(reference);
      resultItem.appendChild(text);

      resultItem.addEventListener("click", () => {
        Navigation.navigateToVerse(result.book, result.chapter, result.verse);
      });

      elements.searchResultsContainer.appendChild(resultItem);
    });
  },
};

// =====================
// THEME MANAGEMENT
// =====================
const Theme = {
  getCurrentTheme() {
    const userPreference = localStorage.getItem("theme");
    if (userPreference) return userPreference;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  },

  setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);

    if (theme === "dark") {
      elements.sunIcon.style.display = "none";
      elements.moonIcon.style.display = "block";
    } else {
      elements.sunIcon.style.display = "block";
      elements.moonIcon.style.display = "none";
    }
  },

  toggle() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    this.setTheme(newTheme);
  },
};

// =====================
// ERROR HANDLING
// =====================
const ErrorHandler = {
  showGenericError(error) {
    console.error("An error occurred:", error);
    elements.verseContainer.style.display = "block";
    elements.verseContainer.innerHTML = `<div class="error-message">An error occurred. Please check the console for details.</div>`;
    Navigation.removeControls();
  },
};

// =====================
// EVENT HANDLERS
// =====================
const EventHandlers = {
  init() {
    this.setupBookSelectHandler();
    this.setupChapterSelectHandler();
    this.setupSearchHandler();
    this.setupKeyboardHandlers();
    this.setupThemeHandlers();
  },

  setupBookSelectHandler() {
    elements.bookSelect.addEventListener("change", () => {
      const selectedBook = parseInt(elements.bookSelect.value, 10);
      state.currentBook = selectedBook;
      state.currentChapter = null;
      state.isNavigatingBook = false;

      elements.chapterSelect.innerHTML =
        '<option value="">Loading Chapters...</option>';
      elements.chapterSelect.disabled = true;
      elements.verseContainer.style.display = "none";
      Navigation.removeControls();

      if (state.tooltipOpen) StrongsHandler.hideTooltip();

      if (selectedBook) {
        DataFetcher.fetchChapters(selectedBook);
      } else {
        elements.chapterSelect.innerHTML =
          '<option value="">Select Book First</option>';
        state.chaptersInCurrentBook = [];
      }
    });
  },

  setupChapterSelectHandler() {
    elements.chapterSelect.addEventListener("change", () => {
      const selectedBook = parseInt(elements.bookSelect.value, 10);
      const selectedChapter = parseInt(elements.chapterSelect.value, 10);

      elements.verseContainer.style.display = "none";
      Navigation.removeControls();
      if (state.tooltipOpen) StrongsHandler.hideTooltip();

      if (selectedBook && selectedChapter) {
        state.currentBook = selectedBook;
        state.currentChapter = selectedChapter;
        state.isNavigatingBook = false;
        UI.scrollTop();
        DataFetcher.fetchVerses(selectedBook, selectedChapter);
      } else if (!selectedChapter) {
        state.currentChapter = null;
      }
    });
  },

  setupSearchHandler() {
    elements.searchInput.addEventListener("keyup", (event) => {
      if (event.key === "Enter") {
        const query = elements.searchInput.value.trim();
        if (query.length < 2) return;

        if (state.searchTimeout) clearTimeout(state.searchTimeout);

        state.searchTimeout = setTimeout(() => {
          const referenceMatch = Search.parseReferenceSearch(query);
          if (referenceMatch) {
            const book = referenceMatch.book;
            elements.bookSelect.value = book;
            state.currentBook = book;
            state.targetChapter = referenceMatch.chapter;
            state.isReferenceSearch = true;
            DataFetcher.fetchChapters(book);
          } else {
            Search.performTextSearch(query);
            state.isReferenceSearch = false;
          }
        }, 300);
      }
    });
  },

  setupKeyboardHandlers() {},

  setupThemeHandlers() {
    elements.themeToggle.addEventListener("click", () => {
      Theme.toggle();
    });

    matchMedia("(prefers-color-scheme: dark)").addEventListener(
      "change",
      (e) => {
        if (!localStorage.getItem("theme")) {
          Theme.setTheme(e.matches ? "dark" : "light");
        }
      }
    );
  },
};

// =====================
// INITIALIZATION
// =====================
async function initialize() {
  await Database.preCacheDatabase();
  await Database.initialize();
  EventHandlers.init();
  StrongsHandler.init();
  Theme.setTheme(Theme.getCurrentTheme());
  
  elements.tooltip.setAttribute('aria-hidden', 'true');
}

document.addEventListener("DOMContentLoaded", initialize);
