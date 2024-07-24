/*
 * Classes that implement the IQuestionLoader can supply questions to Linnaeus
 */
import type { Content, IQuestionLoader, Question } from "./types/index.ts";

/*
 * Load questions from a YAML file.
 */
export class YamlQuestionLoader<T>
  implements IQuestionLoader<Question<Content<T>>> {
  fpath: string;

  constructor(fpath: string) {
    this.fpath = fpath;
  }

  async init() {}

  parseQuestion(_: any): Question<Content<T>> {
    throw new Error("Not implemented");
  }

  async *getQuestions() {
    const yaml = await Deno.readTextFile(this.fpath);
    const questions = JSON.parse(yaml);
    ``;

    for (const question of questions) {
      yield this.parseQuestion(question);
    }
  }

  async close() {}
}

/*
 * Re-iterate a list of questions.
 */
export class LiteralQuestionLoader<T>
  implements IQuestionLoader<Question<Content<T>>> {
  questions: Question<Content<T>>[];

  constructor(questions: Question<Content<T>>[]) {
    this.questions = questions;
  }

  async init() {}

  async *getQuestions() {
    for (const question of this.questions) {
      yield question;
    }
  }

  async close() {}
}
