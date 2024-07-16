import { DB } from "./src/deps.ts";
import { Content, IContent } from "./src/types/index.ts";

const DB_PATH = "/home/rg/.mirror-manifest.db";

export class MirrorContent implements IContent<string> {
  db: DB;

  constructor() {
    this.db = new DB(DB_PATH);
  }

  async getContent(): Promise<Content[]> {
    const content = await this.db.query(`
      select fpath from images where published = '1'
      order by fpath
    `);

    // an ID, and the content. For photos it might be the same.
    return content.map((row: any) => {
      return [row[0], row[0]];
    });
  }
}
