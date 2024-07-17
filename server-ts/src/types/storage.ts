
import { Answer, Question } from "./index.ts";

export interface IInit {
  init(questionLoader: IQuestionLoader<Question>): Promise<void>;
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
 * This is the interface required by the What's That?
 * server
 */
export type IDB =
  & IInit
  & IClose
  & IGetAnswers
  & ISetAnswer;

export type Services = {
  storage: IDB;
};

/*
 * Implementations of this interface can supply content
 * to What's That?
 */
export interface IContentLoader<Content> {
  init(): Promise<void>;
  getContent(): AsyncGenerator<Content>;
  close(): Promise<void>;
}

export interface IQuestionLoader<Question> {
  init(): Promise<void>;
  getQuestions(): AsyncGenerator<Question>;
  close(): Promise<void>;
}
