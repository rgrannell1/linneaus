/*
 * Storage backends implement the IDB interface
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
  questionId    text not null,
  answerId      text not null,
  answer        text not null,

  primary key (contentId, questionId)
);
`;

/*
 * SQLite storage implementation
 *
 * @implements {IDB}
 */
export class SqliteStorage<Content> implements IDB<Content> {
  db: DB;

  static SUPPORTED_TYPES = new Set([
    "pick-one",
    "free-text",
  ]);

  constructor(fpath: string = ".linnaeus.db") {
    this.db = new DB(fpath);
  }

  async init(questionLoader: IQuestionLoader<Question<Content>>) {
    await Promise.all(
      [QUESTIONS_TABLE, ANSWERS_TABLE].map((table) => this.db.query(table)),
    );

    for await (const { id, type, text } of questionLoader.getQuestions()) {
      if (!SqliteStorage.SUPPORTED_TYPES.has(type)) {
        throw new Error(`Unsupported question type: ${type}`);
      }

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
  async *getAnswers(questionId?: string): AsyncGenerator<Answer> {
    if (!questionId) {
      for (
        const [contentId, questionId, answerId, answer] of this.db.query(
          "select contentId, questionId, answerId, answer from answers",
        )
      ) {
        yield {
          contentId,
          questionId,
          answerId,
          answer,
        };
      }

      return;
    }

    for (
      const [contentId, answerId, answer] of this.db.query(
        "select contentId, answerId, answer from answers where questionId = ?",
        [questionId],
      )
    ) {
      yield {
        contentId,
        questionId,
        answerId,
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
      "insert or replace into answers (contentId, questionId, answerId, answer) values (?, ?, ?, ?)",
      [answer.contentId, answer.questionId, answer.answerId, answer.answer],
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
