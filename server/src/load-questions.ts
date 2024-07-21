/*
 * Classes that implement the IQuestionLoader can supply questions to Linnaeus
 */
import type { IQuestionLoader, Question } from "./types/index.ts";

/*
 * Load questions from a YAML file.
 */
export class YamlQuestionLoader<Content>
  implements IQuestionLoader<Question<Content>> {
  fpath: string;

  constructor(fpath: string) {
    this.fpath = fpath;
  }

  async init() {}

  parseQuestion(question: any): Question<Content> {
    throw new Error("Not implemented");
  }

  async *getQuestions() {
    const yaml = await Deno.readTextFile(this.fpath);
    const questions = JSON.parse(yaml);``

    for (const question of questions) {
      yield this.parseQuestion(question);
    }
  }

  async close() {}
}

/*
 * Re-iterate a list of questions.
 */
export class LiteralQuestionLoader<Content>
  implements IQuestionLoader<Question<Content>> {
  questions: Question<Content>[];

  constructor(questions: Question<Content>[]) {
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
