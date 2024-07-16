
export type Config = {
  port: number,
  signal?: AbortSignal
}

export interface Answer {
  questionId: string;
}

export interface QuestionDependency {
  satisfied(answers: Answer[]): Promise<boolean>
}

export interface Question {
  id: string
  type: string
  text: string
  dependsOn: QuestionDependency[]
}

export interface PickOneQuestion extends Question {
  type: 'pick-one'
  choices: string[]
}

export * from "./storage.ts";
