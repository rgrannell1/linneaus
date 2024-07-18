/*
 * Storage backends implement the IDB interface
 *
 */

import { DB } from "./deps.ts";
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

/*
 * SQLite storage implementation
 *
 * @implements {IDB}
 */
export class SqliteStorage<Content> implements IDB<Content> {
  db: DB;
  constructor(fpath: string = ".linnaeus.db") {
    this.db = new DB(fpath);
  }

  async init(questionLoader: IQuestionLoader<Question<Content>>) {
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

  /*
   * Get answers from the database
   *
   * @returns {AsyncGenerator<Answer>}
   */
  async *getAnswers(): AsyncGenerator<Answer> {
    for (const [contentId, questionId, answer] of this.db.query("select * from answers")) {
      yield {
        contentId,
        questionId,
        answer,
      };
    }
  }

  /*
   * Save an answer to the database
   *
   * @param {Answer} answer
   *
   * @returns {Promise<void>}
   */
  async setAnswer(answer: Answer) {
    await this.db.query(
      "insert or replace into answers (contentId, questionId, answer) values (?, ?, ?)",
      [answer.contentId, answer.questionId, answer.answer],
    );
  }

  /*
   * Close the database connection
   *
   * @returns {Promise<void>}
   */
  async close() {
    return this.db.close();
  }
}
