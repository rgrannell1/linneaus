import { Cache } from "../cache.ts";

/*
 * All content should provide:
 * - id: a unique identifier
 * - type: a string that describes the type of content. This is used
 *     to render as text, photo, or another supported type
 */
export type Content<T> = {
  id: string;
  type: string;
  value: T;
};

/*
 * This file defines types used within Linneaus
 */
export type Config = {
  port: number;
  signal?: AbortSignal;
};

export interface Answer {
  contentId: string;
  questionId: string;
  answerId: string;
  answer: string; // todo implement this
}

export type ContentFilter<Content> = (
  content: Content[],
  answers: Answer[],
) => Content[];

export type PickOneQuestion<Content> = {
  id: string;
  type: string;
  relevantContent: ContentFilter<Content>;
  text: string;
  choices: string[];
};

// supported question types
export type Question<Content> = PickOneQuestion<Content>;

/*
 * +++ +++ +++ Interfaces +++ +++ +++
 */
export interface IInit<T> {
  init(questionLoader: IQuestionLoader<Question<T>>): Promise<void>;
}

export interface IClose {
  close(): Promise<void>;
}

export interface IGetAnswers {
  getAnswers(questionId: string): AsyncGenerator<Answer>;
}

export interface ISetAnswer {
  setAnswer(answer: Answer): Promise<void>;
}

export type RowTransformer<T> = (row: unknown[]) => Content<T>;

/*
 * This is the interface required by the Linnaeus
 * server
 */
export type IDB<T> =
  & IInit<T>
  & IClose
  & IGetAnswers
  & ISetAnswer;

export type Services<Content> = {
  storage: IDB<Content>;
  contentLoader: IContentLoader<Content>;
  questionsLoader: IQuestionLoader<Question<Content>>;
  cache: Cache<Content>;
};

/*
 * Implementations of this interface can supply content
 * to Linnaeus
 */
export interface IContentLoader<T> {
  init(): Promise<void>;
  getContent(): AsyncGenerator<T>;
  close(): Promise<void>;
}

/*
 * Implementations of this interface can supply questions
 * to Linnaeus
 */
export interface IQuestionLoader<Question> {
  init(): Promise<void>;
  getQuestions(): AsyncGenerator<Question>;
  close(): Promise<void>;
}
