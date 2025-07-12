class DatabaseService {
  constructor() {
    this.sqlService = new SQLiteService();
    this.isInitialized = false;
    this.initPromise = null;
    this.CACHE_NAME = "concordance-cache-v1";
    this.DB_URL = "./assets/kjv.sqlite";
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
      const buffer = await this.loadDatabaseBuffer();

      await this.sqlService.initialize(buffer);
      this.isInitialized = true;
    } catch (error) {
      throw new Error(`DB initialization failed: ${error.message || error}`);
    }
  }

  async loadDatabaseBuffer() {
    const cachedBuffer = await this.loadFromCache();
    if (cachedBuffer) {
      return cachedBuffer;
    }

    if (!navigator.onLine) {
      throw new Error(
        "Application is offline and the database is not cached. Please connect to the internet to download it for the first time."
      );
    }

    const networkBuffer = await this.loadFromNetwork();

    await this.cacheDatabase(networkBuffer);

    return networkBuffer;
  }

  async loadFromCache() {
    if (!("caches" in window)) {
      return null;
    }

    try {
      const cache = await caches.open(this.CACHE_NAME);
      const possibleKeys = [this.DB_URL, new Request(this.DB_URL)];

      for (const key of possibleKeys) {
        const cachedResponse = await cache.match(key);
        if (cachedResponse) {
          return await cachedResponse.arrayBuffer();
        }
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  async loadFromNetwork() {
    try {
      const response = await fetch(this.DB_URL);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const buffer = await response.arrayBuffer();
      return buffer;
    } catch (error) {
      throw new Error(
        `Network error while fetching database: ${error.message}`
      );
    }
  }

  async cacheDatabase(buffer) {
    if (!("caches" in window)) {
      console.warn("Cache API not supported - database will not be cached");
      return;
    }

    try {
      const cache = await caches.open(this.CACHE_NAME);
      const responseToCache = new Response(buffer.slice(0), {
        headers: {
          "Content-Type": "application/octet-stream",
          "Cache-Control": "public, max-age=315360000",
        },
      });

      await cache.put(this.DB_URL, responseToCache);
    } catch (error) {
      console.warn("Failed to cache database", error);
    }
  }

  async getChapters(book) {
    this.validateBookNumber(book);
    try {
      return await this.sqlService.queryColumn(
        "SELECT DISTINCT chapter FROM verses WHERE book = :book ORDER BY chapter",
        { ":book": book }
      );
    } catch (error) {
      throw new Error(
        `Failed to fetch chapters for book ${book}: ${error.message}`
      );
    }
  }

  async getVerses(book, chapter) {
    this.validateBookNumber(book);
    this.validateChapterNumber(chapter);
    try {
      return await this.sqlService.query(
        "SELECT verse, text FROM verses WHERE book = :book AND chapter = :chapter ORDER BY verse",
        { ":book": book, ":chapter": chapter }
      );
    } catch (error) {
      throw new Error(
        `Failed to fetch verses for ${book}:${chapter}: ${error.message}`
      );
    }
  }

  async getStrongsInfo(key) {
    this.validateStrongsKey(key);
    try {
      return await this.sqlService.queryOne(
        "SELECT key, lemma, xlit, pron, derivation, strongs_def, kjv_def, translit FROM strongs WHERE key = :key LIMIT 1",
        { ":key": key }
      );
    } catch (error) {
      throw new Error(
        `Failed to fetch Strong's info for ${key}: ${error.message}`
      );
    }
  }

  async searchText(query, limit = 20) {
    this.validateSearchQuery(query);

    const searchQuery = query.trim();
    if (searchQuery.length < 2) {
      return { results: [], query: searchQuery };
    }

    try {
      const ftsQuery = `"${searchQuery.replace(/"/g, '""')}*"`;
      const results = await this.sqlService.query(
        "SELECT book, chapter, verse, text FROM verses WHERE text MATCH :query ORDER BY book, chapter, verse LIMIT :limit",
        { ":query": ftsQuery, ":limit": limit }
      );

      return { results, query: searchQuery };
    } catch (error) {
      throw new Error(`Failed to search for "${query}": ${error.message}`);
    }
  }

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
