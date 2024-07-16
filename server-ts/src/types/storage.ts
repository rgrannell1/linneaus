import { Question } from "./index.ts";

/*
 * Server routes. Implement these yourself for
 * different types of content.
 */
export interface IGetContentCount {
  getContentCount(): Promise<Number>;
}

export interface IGetContent<Content> {
  getContent(): Promise<Content>;
}

export interface IAddQuestion<Question> {
  addQuestion(question: Question): Promise<void>;
}

export interface IGetContentMetadata<ContentMetadata> {
  getContentMetadata(): Promise<ContentMetadata>;
}

export interface IGetAnswer {}

export interface IClose {
  close(): Promise<void>;
}

/*
 * This is the interface required by the What's That?
 * server
 */
export type IDB<Content, ContentMetadata> =
  & IGetContentCount
  & IGetContent<Content>
  & IGetContentMetadata<ContentMetadata>
  & IClose;

export type Services<Content, ContentMetadata> = {
  storage: IDB<Content, ContentMetadata>;
};

/*
 * Implementations of this interface can supply content
 * to What's That?
 */
export interface IContent<Content> {
  getContent(): Promise<Content[]>;
}
