
// TODO move to dependencies
import Ajv from 'https://esm.sh/ajv';
import * as path from "https://deno.land/std/path/mod.ts";

const __dirname = path.dirname(path.fromFileUrl(import.meta.url));
const schemaPath = path.resolve(__dirname, "./schemas/questions.json");

const schema = new Ajv().compile(JSON.parse(
  await Deno.readTextFile(schemaPath)
));

/*
 * Classes that implement the IQuestionLoader can supply questions to Linnaeus
 */
import type { Content, IQuestionLoader, Question } from "./types/index.ts";

function validateQuestion<T>(question: unknown) {
  schema(question);
}

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

  parseQuestion(question: unknown): Question<Content<T>> {
    validateQuestion(question);

    // TODO does not remotely work.
    return question as Question<Content<T>>;
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

export class JSONQuestionLoader<T>
  implements IQuestionLoader<Question<Content<T>>> {
  fpath: string;

  constructor(fpath: string) {
    this.fpath = fpath;
  }

  async init() {}

  parseQuestion(question: unknown) {
    validateQuestion(question);

    return question as Question<Content<T>>;
  }

  async *getQuestions() {
    const json = await Deno.readTextFile(this.fpath);
    const questions = JSON.parse(json);


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
