/*
 * Classes that implement the IContent interface can
 * provide content to InfoLabel
 */

import { parse as parseCsv } from "jsr:@std/csv";

import { DB } from "https://deno.land/x/sqlite/mod.ts";
import { IContentLoader } from "./types/index.ts";

type RowTransformer<Content> = (row: unknown) => Content;

/*
 * Read Sqlite content from a file
 *
 */
export class SqliteContent<Content> implements IContentLoader<Content> {
  db: DB;
  query: string;
  transformer: RowTransformer<Content>;

  constructor(
    fpath: string,
    query: string,
    transformer: RowTransformer<Content>,
  ) {
    this.db = new DB(fpath);
    this.query = query;
    this.transformer = transformer;
  }

  async init() {}

  async *getContent() {
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
 * Read JSON content from a file.
 *
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
