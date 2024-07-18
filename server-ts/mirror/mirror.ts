import { DB } from "../src/deps.ts";
import { SqliteContent } from "../src/load-content.ts";

const DB_PATH = "/home/rg/.mirror-manifest.db";

export type PhotoContent = {
  id: string;
  fpath: string;
};

/*
 * Convert each row to a PhotoContent object
 *
 * @param row - A row from the Sqlite database
 *
 * @returns A PhotoContent object
 */
function transformer(row): PhotoContent {
  const [fpath] = row;

  return {
    id: fpath,
    fpath,
  };
}

/*
 * Load images from the Sqlite database
 *
 * @param dbPath - The path to the Sqlite database
 *
 * @returns A class that implements IContentLoader
 */
export class MirrorContentLoader extends SqliteContent<PhotoContent> {
  db: DB;

  constructor(dbPath: string = DB_PATH) {
    const db = new DB(dbPath);
    const query = `
      select fpath from images where published = '1'
      order by fpath
    `;
    super(db, query, transformer);

    this.db = db;
    this.transformer = transformer;
  }
}
