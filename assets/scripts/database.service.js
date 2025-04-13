class BibleDatabaseService {
  constructor() {
    this.sqlDB = null;
    this.isInitialized = false;
    this.initPromise = null;
    this.callbacks = {};
    this.requestId = 0;
    this.CACHE_NAME = "concordance-cache-v1";
    this.DB_NAME = "assets/kjv.sqlite";
    this.VERSION_KEY = "dbVersion";
  }

  async init() {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise(async (resolve, reject) => {
      try {
        if (typeof initSqlJs === "undefined") {
          try {
            await this.loadScript("assets/scripts/worker.sql-wasm.js");
          } catch (e) {
            console.error("error importing worker.sql-wasm.js:", e);
            reject(
              new Error(
                "Failed to load sql.js worker script. Ensure worker.sql-wasm.js and sql-wasm.wasm are present and accessible."
              )
            );
            return;
          }
        }

        const SQL = await initSqlJs();

        try {
          const version = await this.checkForDatabaseUpdates();
          const dbUrl = `${this.DB_NAME}?v=${version}`;

          let buffer = null;
          let source = "";

          if ("caches" in self) {
            try {
              const cache = await caches.open(this.CACHE_NAME);
              const cachedResponses = await Promise.all([
                cache.match(dbUrl),
                cache.match(this.DB_NAME), // Also check without version parameter
              ]);

              const cachedResponse = cachedResponses[0] || cachedResponses[1];

              if (cachedResponse) {
                buffer = await cachedResponse.arrayBuffer();
                source = "cache";
                console.log("loading database from cache");
              }
            } catch (e) {
              console.warn("failed to check cache", e);
            }
          }

          // If not in cache and online, try to fetch from network
          if (!buffer && navigator.onLine) {
            try {
              const response = await fetch(dbUrl);
              if (response.ok) {
                buffer = await response.arrayBuffer();
                source = "network";
                console.log("fetched database from network");

                // Store in cache for future offline use
                if ("caches" in self) {
                  const cache = await caches.open(this.CACHE_NAME);
                  const responseToCache = new Response(buffer.slice(0));
                  await cache.put(dbUrl, responseToCache);
                  console.log("cached database for offline use");
                }
              } else {
                reject(
                  new Error("Failed to fetch database: " + response.status)
                );
                return;
              }
            } catch (fetchError) {
              console.error("network fetch failed", fetchError);
              reject(new Error("Network fetch failed: " + fetchError.message));
              return;
            }
          }

          if (buffer) {
            console.log(
              `loaded database from ${source}, size: ${buffer.byteLength} bytes`
            );
            this.sqlDB = new SQL.Database(new Uint8Array(buffer));
            this.isInitialized = true;
            resolve();
          } else {
            reject(
              new Error(
                "Cannot load database: device is offline and no cached version found"
              )
            );
          }
        } catch (error) {
          console.error("database initialization failed:", error);
          reject(
            new Error(`DB initialization failed: ${error.message || error}`)
          );
        }
      } catch (error) {
        console.error("worker database initialization failed:", error);
        reject(
          new Error(
            `Worker DB initialization failed: ${error.message || error}`
          )
        );
      }
    });

    return this.initPromise;
  }

  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve();
      script.onerror = (e) =>
        reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  }

  async checkForDatabaseUpdates() {
    const storedVersion = localStorage.getItem(this.VERSION_KEY) || "1.0.0";

    if (!navigator.onLine) {
      console.log("offline: using stored database version:", storedVersion);
      return storedVersion;
    }

    try {
      const response = await fetch(`assets/db-version.json?t=${Date.now()}`);

      if (response.ok) {
        const data = await response.json();

        if (data.version !== storedVersion) {
          console.log(
            `database update available: ${storedVersion} → ${data.version}`
          );
          localStorage.setItem(this.VERSION_KEY, data.version);

          // Only clear cache if version changed
          if ("caches" in self) {
            try {
              const cache = await caches.open(this.CACHE_NAME);
              const cacheKeys = await cache.keys();
              for (const request of cacheKeys) {
                if (request.url.includes(this.DB_NAME)) {
                  await cache.delete(request);
                  console.log("cleared cached database due to version change");
                }
              }
            } catch (e) {
              console.error("error clearing cache", e);
            }
          }

          return data.version;
        } else {
          console.log("database is up to date", storedVersion);
        }
      }
    } catch (error) {
      console.warn("unable to check for updates", error);
    }

    return storedVersion;
  }

  async getChapters(book) {
    await this.ensureInitialized();

    if (!book || typeof book !== "number") {
      throw new Error("Invalid book number for getChapters");
    }

    const stmt = this.sqlDB.prepare(
      "SELECT DISTINCT chapter FROM verses WHERE book = :book ORDER BY chapter"
    );
    stmt.bind({ ":book": book });

    const results = [];
    while (stmt.step()) {
      results.push(stmt.get()[0]);
    }
    stmt.free();

    return results;
  }

  async getVerses(book, chapter) {
    await this.ensureInitialized();

    if (
      !book ||
      typeof book !== "number" ||
      !chapter ||
      typeof chapter !== "number"
    ) {
      throw new Error("Invalid book/chapter number for getVerses");
    }

    const stmt = this.sqlDB.prepare(
      "SELECT verse, text FROM verses WHERE book = :book AND chapter = :chapter ORDER BY verse"
    );
    stmt.bind({ ":book": book, ":chapter": chapter });

    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();

    return results;
  }

  async getStrongsInfo(key) {
    await this.ensureInitialized();

    if (!key || typeof key !== "string") {
      throw new Error("Invalid key for getStrongsInfo");
    }

    const stmt = this.sqlDB.prepare(
      "SELECT key, lemma, xlit, pron, derivation, strongs_def, kjv_def, translit FROM strongs WHERE key = :key LIMIT 1"
    );
    stmt.bind({ ":key": key });

    let results = null;
    if (stmt.step()) {
      results = stmt.getAsObject();
    }
    stmt.free();

    return results;
  }

  async searchText(query, limit = 20) {
    await this.ensureInitialized();

    if (!query || typeof query !== "string") {
      throw new Error("Invalid query for text search");
    }

    const searchQuery = query.trim();

    if (searchQuery.length < 2) {
      return {
        results: [],
        query: searchQuery,
      };
    }

    // Create a FTS query with wildcards for partial matching
    const ftsQuery = `"${searchQuery.replace(/"/g, '""')}*"`;

    const stmt = this.sqlDB.prepare(
      "SELECT book, chapter, verse, text FROM verses WHERE text MATCH :query ORDER BY book, chapter, verse LIMIT :limit"
    );

    stmt.bind({
      ":query": ftsQuery,
      ":limit": limit,
    });

    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();

    return {
      results: results,
      query: searchQuery,
    };
  }

  async ensureInitialized() {
    if (!this.isInitialized) {
      await this.init();
    }

    if (!this.sqlDB) {
      throw new Error("Database not initialized");
    }
  }

  dispose() {
    if (this.sqlDB) {
      this.sqlDB.close();
      this.sqlDB = null;
      this.isInitialized = false;
      this.initPromise = null;
    }
  }
}
