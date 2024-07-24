import type {
  Content,
  IContentLoader,
  IDB,
  IQuestionLoader,
  Question,
} from "./types/index.ts";

export class Cache<T> {
  contentLoader: IContentLoader<Content<T>>;
  questionsLoader: IQuestionLoader<Question<Content<T>>>;
  storage?: IDB<Content<T>>;

  _content: Content<T>[];
  _questions: Question<Content<T>>[];

  constructor(
    contentLoader: IContentLoader<Content<T>>,
    questionsLoader: IQuestionLoader<Question<Content<T>>>,
    storage: IDB<Content<T>>,
  ) {
    this.contentLoader = contentLoader;
    this.questionsLoader = questionsLoader;
    this.storage = storage;
  }

  async getContent(): Promise<Content<T>[]> {
    if (this._content) {
      return this._content;
    }

    this._content = await Array.fromAsync(this.contentLoader.getContent());
    return this._content;
  }

  async getQuestions() {
    if (this._questions) {
      return this._questions;
    }

    this._questions = await Array.fromAsync(
      this.questionsLoader.getQuestions(),
    );
    return this._questions;
  }

  async getAnswers(questionId: string) {
    // TODO actually make this work
    return await Array.fromAsync(this.storage.getAnswers(questionId));
  }
}
