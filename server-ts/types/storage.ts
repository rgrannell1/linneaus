import { Question } from "./index.ts";

export type Row<T> = [(string | number)[], T];

export interface IStorageBackend {
  init(): Promise<void>;
  close(): Promise<void>
  getValue<T>(table: string[], id?: string): Promise<T | null>
  setValue<T>(table: string[], id: string, value: T): Promise<void>;
}

/*
 * Server routes. Implement these yourself for
 * different types of content.
 *
 */
export interface IGetQuestions {
  getQuestions(): Promise<Question[]>
}

export interface IGetContentCount {
  getContentCount(): Promise<Number>
}

export interface IGetContent<Content>{
  getContent(): Promise<Content>
}

export interface IAddQuestion<Question> {
  addQuestion(question: Question): Promise<void>
}

export interface IGetContentMetadata<ContentMetadata>{
  getContentMetadata(): Promise<ContentMetadata>
}

export interface IGetAnswer {}

export interface IClose {
  close(): Promise<void>
}

/*
 * This is the interface required by the What's That?
 * server
 */
export type IDB<Content, ContentMetadata> =
  IGetQuestions &
  IGetContentCount &
  IGetContent<Content> &
  IAddQuestion<Question> &
  IGetContentMetadata<ContentMetadata> &
  IClose


export type Services<Content, ContentMetadata> = {
  storage: IDB<Content, ContentMetadata>
}
