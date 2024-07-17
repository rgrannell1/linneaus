import type { IQuestionLoader, Question } from "./types/index.ts";

/*
 * Load questions from a YAML file.
 */
export class YamlQuestionLoader implements IQuestionLoader<Question> {
  fpath: string;

  constructor(fpath: string) {
    this.fpath = fpath;
  }

  async init() {}

  parseQuestion(question: any): Question {
    throw new Error("Not implemented");
  }

  async *getQuestions() {
    const yaml = await Deno.readTextFile(this.fpath);
    const questions = JSON.parse(yaml);

    for (const question of questions) {
      yield this.parseQuestion(question);
    }
  }

  async close() {}
}

/*
 * Load questions from a list of questions.
 */
export class LiteralQuestionLoader implements IQuestionLoader<Question> {
  questions: Question[];

  constructor(questions: Question[]) {
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
