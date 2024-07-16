export type Config = {
  port: number;
  signal?: AbortSignal;
};

export interface Answer {
  contentId:  string;
  questionId: string;
  answer:     string;
}

export interface Content {
  id:    string;
  value: string;
}

export interface Question {
  id: string;
  type: string;
  text: string;
}

export * from "./storage.ts";
