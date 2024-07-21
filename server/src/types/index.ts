import { Cache } from "../cache.ts";

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
  answer: string;
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
export interface IInit<Content> {
  init(questionLoader: IQuestionLoader<Question<Content>>): Promise<void>;
}

export interface IClose {
  close(): Promise<void>;
}

export interface IGetAnswers {
  getAnswers(): AsyncGenerator<Answer>;
}

export interface ISetAnswer {
  setAnswer(answer: Answer): Promise<void>;
}

/*
 * This is the interface required by the Linnaeus
 * server
 */
export type IDB<Content> =
  & IInit<Content>
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
export interface IContentLoader<Content> {
  init(): Promise<void>;
  getContent(): AsyncGenerator<Content>;
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
