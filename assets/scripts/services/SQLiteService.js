class SQLiteService {
  constructor() {
    this.db = null;
    this.isReady = false;
    this.initPromise = null;
  }

  async initialize(dbBuffer) {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise(async (resolve, reject) => {
      try {
        if (typeof initSqlJs === "undefined") {
          throw new Error(
            "sql.js not loaded. Please ensure sql-wasm.js is included in your HTML."
          );
        }

        const SQL = await initSqlJs({
          locateFile: (file) => `assets/scripts/libs/${file}`,
        });

        this.db = new SQL.Database(new Uint8Array(dbBuffer));
        this.isReady = true;
        resolve();
      } catch (error) {
        reject(new Error(`SQLite initialization failed: ${error.message}`));
      }
    });

    return this.initPromise;
  }

  async query(sql, params = {}) {
    this.ensureReady();

    const stmt = this.db.prepare(sql);
    stmt.bind(params);

    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();

    return results;
  }

  async queryOne(sql, params = {}) {
    this.ensureReady();

    const stmt = this.db.prepare(sql);
    stmt.bind(params);

    let result = null;
    if (stmt.step()) {
      result = stmt.getAsObject();
    }
    stmt.free();

    return result;
  }

  async queryColumn(sql, params = {}) {
    this.ensureReady();

    const stmt = this.db.prepare(sql);
    stmt.bind(params);

    const results = [];
    while (stmt.step()) {
      results.push(stmt.get()[0]);
    }
    stmt.free();

    return results;
  }

  ensureReady() {
    if (!this.isReady || !this.db) {
      throw new Error("Database not initialized");
    }
  }

  dispose() {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.isReady = false;
      this.initPromise = null;
    }
  }
}
