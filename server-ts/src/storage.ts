import { DB } from "https://deno.land/x/sqlite/mod.ts";

import type { Answer, IDB, Question } from "./types/index.ts";

const QUESTIONS_TABLE = `
create table if not exists questions (
  id      text primary key,
  text    text not null
);
`;

const ANSWERS_TABLE = `
create table if not exists answers (
  contentId     text not null,
  questionId    text primary key,
  answer        text not null
);
`;

export class SqliteStorage<Content, ContentMetadata>
  implements IDB<Content, ContentMetadata> {
  db: DB;
  constructor(fpath: string = ".whatsit.db") {
    this.db = new DB(fpath);
  }

  async init(questions: Question[]) {
    await Promise.all([QUESTIONS_TABLE, ANSWERS_TABLE].map(table => this.db.query(table)));

    for (const { id, text } of questions) {
      await this.db.query(
        "insert or replace into questions (id, text) values (?, ?)",
        [id, text],
      );
    }
  }

  async getAnswers(): Promise<Answer[]> {
    return await this.db.query(`select * from answers`);
  }

  async getContentCount(): Promise<Number> {
    return 0;
  }

  async getContent<Content>(): Promise<Content> {
    return 0 as any;
  }

  async getContentMetadata(): Promise<ContentMetadata> {
    return 0 as any;
  }

  async close() {}
}
