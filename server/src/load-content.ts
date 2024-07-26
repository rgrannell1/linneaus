/*
 * Classes that implement the IContent interface can
 * provide content to Linneaus
 */
import { DB, parseCsv } from "./deps.ts";
import { Content, IContentLoader, RowTransformer } from "./types/index.ts";

/*
 * Read Sqlite content from a file.
 *
 * A SQL query is provided, and a transformer function converts the retrieved rows into
 * the desired content (with type Content)
 */
export class SqliteContent<T> implements IContentLoader<T> {
  db: DB;
  query: string;
  transformer: RowTransformer<T>;

  constructor(
    fpath: string,
    query: string,
    transformer: RowTransformer<T>,
  ) {
    this.db = new DB(fpath);
    this.query = query;
    this.transformer = transformer;
  }

  async init() {}

  /*
   * Yield all the content from the database, after transforming it
   */
  async *getContent(): AsyncGenerator<Content<T>> {
    for (const row of this.db.query(this.query)) {
      yield this.transformer(row);
    }
  }

  async close() {
    this.db.close();
  }
}

/*
 * Read CSV content from a file
 *
 * A transformer function converts the retrieved rows into
 * the desired content (with type Content)
 *
 * Headers can be skipped
 */
export class CSVContent<Content> implements IContentLoader<Content> {
  fpath: string;
  transformer: RowTransformer<Content>;
  hasHeaders: boolean;

  constructor(
    fpath: string,
    transformer: RowTransformer<Content>,
    headers: boolean = true,
  ) {
    this.fpath = fpath;
    this.transformer = transformer;
    this.hasHeaders = headers;
  }

  async init() {}

  async *getContent() {
    const text = await Deno.readTextFile(this.fpath);
    const rows = parseCsv(text, {
      skipFirstRow: this.hasHeaders,
    });

    for (const row of rows) {
      yield this.transformer(row);
    }
  }

  async close() {}
}

/*
 * Read JSON content from a file. The JSON file must contain an array
 *
 * A transformer function converts the retrieved rows into
 * the desired content (with type Content)
 */
export class JSONContent<Content> implements IContentLoader<Content> {
  fpath: string;
  transformer: RowTransformer<Content>;

  constructor(fpath: string, transformer: RowTransformer<Content>) {
    this.fpath = fpath;
    this.transformer = transformer;
  }

  async init() {}

  async *getContent() {
    const text = await Deno.readTextFile(this.fpath);
    const rows = JSON.parse(text);

    if (!Array.isArray(rows)) {
      throw new Error("JSON file must contain an array");
    }

    for (const row of rows) {
      yield this.transformer(row);
    }
  }

  async close() {}
}
