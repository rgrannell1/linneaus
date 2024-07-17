import { DB } from "./src/deps.ts";
import { SqliteContent } from "./src/content.ts";

const DB_PATH = "/home/rg/.mirror-manifest.db";

type PhotoContent = {
  id: string;
  fpath: string;
};

function transformer(row): PhotoContent {
  return {
    id: row[0],
    fpath: row[0],
  };
}

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
