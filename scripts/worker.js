let sqlDB = null;
const dbPath = "../kjv.sqlite";

try {
  self.importScripts("worker.sql-wasm.js");
} catch (e) {
  console.error("Error importing worker.sql-wasm.js:", e);
  postMessage({
    type: "error",
    payload:
      "Failed to load sql.js worker script. Ensure worker.sql-wasm.js and sql-wasm.wasm are present and accessible.",
  });
  throw e;
}

async function initializeDatabase() {
  try {
    const SQL = await initSqlJs();
    console.log("sql.js initialized in worker");

    console.log(`Fetching database: ${dbPath}`);
    const response = await fetch(dbPath);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch database: ${response.status} ${response.statusText}`
      );
    }
    const buffer = await response.arrayBuffer();
    console.log(
      `Database fetched (${(buffer.byteLength / 1024 / 1024).toFixed(2)} MB)`
    );

    sqlDB = new SQL.Database(new Uint8Array(buffer));
    console.log("Database loaded successfully in worker");

    postMessage({ type: "ready" });
  } catch (error) {
    console.error("Worker database initialization failed:", error);
    postMessage({
      type: "error",
      payload: `Worker DB initialization failed: ${error.message || error}`,
    });
  }
}

self.onmessage = function (event) {
  if (!sqlDB && event.data.type !== "init") {
    console.warn("Worker received message before DB was ready:", event.data);
    postMessage({ type: "error", payload: "Database not initialized yet." });
    return;
  }
  if (!sqlDB && event.data.type === "init") {
    console.log(
      "Worker received init message, DB loading is already in progress."
    );
    return;
  }
  if (!sqlDB) {
    postMessage({ type: "error", payload: "Database not ready." });
    return;
  }

  const { type, payload } = event.data;

  try {
    let results;
    let stmt;

    switch (type) {
      case "getChapters":
        if (!payload || typeof payload.book !== "number") {
          throw new Error("Invalid book number for getChapters");
        }
        stmt = sqlDB.prepare(
          "SELECT DISTINCT chapter FROM verses WHERE book = :book ORDER BY chapter"
        );
        stmt.bind({ ":book": payload.book });
        results = [];
        while (stmt.step()) {
          results.push(stmt.get()[0]);
        }
        stmt.free();
        postMessage({ type: "chaptersResult", payload: results });
        break;

      case "getVerses":
        if (
          !payload ||
          typeof payload.book !== "number" ||
          typeof payload.chapter !== "number"
        ) {
          throw new Error("Invalid book/chapter number for getVerses");
        }
        stmt = sqlDB.prepare(
          "SELECT verse, text FROM verses WHERE book = :book AND chapter = :chapter ORDER BY verse"
        );
        stmt.bind({ ":book": payload.book, ":chapter": payload.chapter });
        results = [];
        while (stmt.step()) {
          results.push(stmt.getAsObject());
        }
        stmt.free();
        postMessage({ type: "versesResult", payload: results });
        break;

      case "getStrongsInfo":
        if (!payload || typeof payload.key !== "string") {
          throw new Error("Invalid key for getStrongsInfo");
        }
        stmt = sqlDB.prepare(
          "SELECT key, lemma, xlit, pron, derivation, strongs_def, kjv_def, translit FROM strongs WHERE key = :key LIMIT 1"
        );
        stmt.bind({ ":key": payload.key });
        results = null;
        if (stmt.step()) {
          results = stmt.getAsObject();
        }
        stmt.free();
        postMessage({ type: "strongsInfoResult", payload: results });
        break;
      case "searchText":
        if (!payload || typeof payload.query !== "string") {
          throw new Error("Invalid query for text search");
        }

        const searchQuery = payload.query.trim();
        const searchLimit = payload.limit || 20;

        if (searchQuery.length < 2) {
          postMessage({
            type: "searchResultsReady",
            payload: {
              results: [],
              query: searchQuery,
            },
          });
          break;
        }

        // Create a FTS query with wildcards for partial matching
        const ftsQuery = `"${searchQuery.replace(/"/g, '""')}*"`;

        stmt = sqlDB.prepare(
          "SELECT book, chapter, verse, text FROM verses WHERE text MATCH :query ORDER BY book, chapter, verse LIMIT :limit"
        );

        stmt.bind({
          ":query": ftsQuery,
          ":limit": searchLimit,
        });

        results = [];
        while (stmt.step()) {
          results.push(stmt.getAsObject());
        }
        stmt.free();

        postMessage({
          type: "searchResultsReady",
          payload: {
            results: results,
            query: searchQuery,
          },
        });
        break;

      default:
        console.warn("Worker received unknown message type:", type);
        postMessage({ type: "error", payload: `Unknown command: ${type}` });
    }
  } catch (error) {
    console.error(`Worker error handling message type '${type}':`, error);
    if (
      typeof stmt !== "undefined" &&
      stmt &&
      typeof stmt.free === "function"
    ) {
      try {
        stmt.free();
      } catch (freeError) {
        console.error("Error freeing statement after error:", freeError);
      }
    }
    postMessage({
      type: "error",
      payload: `Error processing ${type}: ${error.message || error}`,
    });
  }
};

initializeDatabase();
