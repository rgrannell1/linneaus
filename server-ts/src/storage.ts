import { DB } from "https://deno.land/x/sqlite/mod.ts";

import type { Answer, IDB, IQuestionLoader, Question } from "./types/index.ts";

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

export class SqliteStorage
  implements IDB {
  db: DB;
  constructor(fpath: string = ".whatsit.db") {
    this.db = new DB(fpath);
  }

  async init(questionLoader: IQuestionLoader<Question>) {
    await Promise.all(
      [QUESTIONS_TABLE, ANSWERS_TABLE].map((table) => this.db.query(table)),
    );

    for await (const { id, text } of questionLoader.getQuestions()) {
      await this.db.query(
        "insert or replace into questions (id, text) values (?, ?)",
        [id, text],
      );
    }
  }

  async *getAnswers(): AsyncGenerator<Answer> {
    const query = "select * from answers";

    for (const row of this.db.query(query)) {
      yield row;
    }
  }

  async setAnswer(answer: Answer) {
    await this.db.query(
      "insert or replace into answers (contentId, questionId, answer) values (?, ?, ?)",
      [answer.contentId, answer.questionId, answer.answer],
    );
  }

  async close() {}
}
