import type {
  IContentLoader,
  IDB,
  IQuestionLoader,
  Question,
} from "./types.ts";

export class Cache<Content> {
  contentLoader: IContentLoader<Content>;
  questionsLoader: IQuestionLoader<Question<Content>>;
  storage?: IDB<Content>;

  _content: Content[];
  _questions: Question<Content>[];

  constructor(
    contentLoader: IContentLoader<Content>,
    questionsLoader: IQuestionLoader<Question<Content>>,
    storage: IDB<Content>,
  ) {
    this.contentLoader = contentLoader;
    this.questionsLoader = questionsLoader;
    this.storage = storage;
  }

  async getContent(): Promise<Content[]> {
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
    return await Array.fromAsync(this.storage.getAnswers(questionId));
  }
}
