class DatabaseService {
  constructor() {
    this.sqlService = new SQLiteService();
    this.isInitialized = false;
    this.initPromise = null;
    this.CACHE_NAME = "concordance-cache-v1";
    this.DB_NAME = "assets/kjv.sqlite";
    this.VERSION_KEY = "dbVersion";
  }

  async init() {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this.initializeDatabase();
    return this.initPromise;
  }

  async initializeDatabase() {
    try {
      const version = await this.checkForDatabaseUpdates();
      const buffer = await this.loadDatabaseBuffer(version);

      await this.sqlService.initialize(buffer);
      this.isInitialized = true;

      console.log(
        `Database loaded successfully, size: ${buffer.byteLength} bytes`
      );
    } catch (error) {
      console.error("Database initialization failed:", error);
      throw new Error(`DB initialization failed: ${error.message || error}`);
    }
  }

  async loadDatabaseBuffer(version) {
    const dbUrl = `${this.DB_NAME}?v=${version}`;

    // Try cache first
    let buffer = await this.loadFromCache(dbUrl);
    if (buffer) {
      console.log("Loading database from cache");
      return buffer;
    }

    if (!navigator.onLine) {
      throw new Error(
        "Cannot load database: device is offline and no cached version found"
      );
    }

    buffer = await this.loadFromNetwork(dbUrl);
    console.log("Fetched database from network");

    // Cache for future use
    await this.cacheDatabase(dbUrl, buffer);

    return buffer;
  }

  async loadFromCache(dbUrl) {
    if (!("caches" in self)) return null;

    try {
      const cache = await caches.open(this.CACHE_NAME);
      const cachedResponses = await Promise.all([
        cache.match(dbUrl),
        cache.match(this.DB_NAME),
      ]);
      const cachedResponse = cachedResponses[0] || cachedResponses[1];

      if (cachedResponse) {
        return await cachedResponse.arrayBuffer();
      }
    } catch (e) {
      console.warn("Failed to check cache", e);
    }

    return null;
  }

  async loadFromNetwork(dbUrl) {
    const response = await fetch(dbUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch database: " + response.status);
    }
    return await response.arrayBuffer();
  }

  async cacheDatabase(dbUrl, buffer) {
    if (!("caches" in self)) return;

    try {
      const cache = await caches.open(this.CACHE_NAME);
      const responseToCache = new Response(buffer.slice(0));
      await cache.put(dbUrl, responseToCache);
      console.log("Cached database for offline use");
    } catch (e) {
      console.warn("Failed to cache database", e);
    }
  }

  async checkForDatabaseUpdates() {
    const storedVersion = localStorage.getItem(this.VERSION_KEY) || "1.0.0";

    if (!navigator.onLine) {
      console.log("Offline: using stored database version:", storedVersion);
      return storedVersion;
    }

    try {
      const response = await fetch(`assets/db-version.json?t=${Date.now()}`);

      if (response.ok) {
        const data = await response.json();

        if (data.version !== storedVersion) {
          console.log(
            `Database update available: ${storedVersion} → ${data.version}`
          );
          localStorage.setItem(this.VERSION_KEY, data.version);
          await this.clearCachedDatabase();
          return data.version;
        } else {
          console.log("Database is up to date", storedVersion);
        }
      }
    } catch (error) {
      console.warn("Unable to check for updates", error);
    }

    return storedVersion;
  }

  async clearCachedDatabase() {
    if (!("caches" in self)) return;

    try {
      const cache = await caches.open(this.CACHE_NAME);
      const cacheKeys = await cache.keys();
      for (const request of cacheKeys) {
        if (request.url.includes(this.DB_NAME)) {
          await cache.delete(request);
          console.log("Cleared cached database due to version change");
        }
      }
    } catch (e) {
      console.error("Error clearing cache", e);
    }
  }

  // Database query methods
  async getChapters(book) {
    this.validateBookNumber(book);
    return await this.sqlService.queryColumn(
      "SELECT DISTINCT chapter FROM verses WHERE book = :book ORDER BY chapter",
      { ":book": book }
    );
  }

  async getVerses(book, chapter) {
    this.validateBookNumber(book);
    this.validateChapterNumber(chapter);
    return await this.sqlService.query(
      "SELECT verse, text FROM verses WHERE book = :book AND chapter = :chapter ORDER BY verse",
      { ":book": book, ":chapter": chapter }
    );
  }

  async getStrongsInfo(key) {
    this.validateStrongsKey(key);
    return await this.sqlService.queryOne(
      "SELECT key, lemma, xlit, pron, derivation, strongs_def, kjv_def, translit FROM strongs WHERE key = :key LIMIT 1",
      { ":key": key }
    );
  }

  async searchText(query, limit = 20) {
    this.validateSearchQuery(query);

    const searchQuery = query.trim();
    if (searchQuery.length < 2) {
      return { results: [], query: searchQuery };
    }

    const ftsQuery = `"${searchQuery.replace(/"/g, '""')}*"`;
    const results = await this.sqlService.query(
      "SELECT book, chapter, verse, text FROM verses WHERE text MATCH :query ORDER BY book, chapter, verse LIMIT :limit",
      { ":query": ftsQuery, ":limit": limit }
    );

    return { results, query: searchQuery };
  }

  // Validation methods
  validateBookNumber(book) {
    if (!book || typeof book !== "number" || book < 1 || book > 66) {
      throw new Error("Invalid book number");
    }
  }

  validateChapterNumber(chapter) {
    if (!chapter || typeof chapter !== "number") {
      throw new Error("Invalid chapter number");
    }
  }

  validateStrongsKey(key) {
    if (!key || typeof key !== "string") {
      throw new Error("Invalid key for Strong's lookup");
    }
  }

  validateSearchQuery(query) {
    if (!query || typeof query !== "string") {
      throw new Error("Invalid search query");
    }
  }

  dispose() {
    this.sqlService.dispose();
    this.isInitialized = false;
    this.initPromise = null;
  }
}
