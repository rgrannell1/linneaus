
import type { IDB, IStorageBackend, Question } from './types/index.ts';

export class WhatsItStorage<Content, ContentMetadata> implements IDB<Content, ContentMetadata> {
  backend: IStorageBackend

  constructor(backend: IStorageBackend) {
    this.backend = backend;
  }
  async init(questions: Question[]) {
    for (const question of questions) {
      await this.addQuestion(question);
    }
  }

  async addQuestion(question: Question): Promise<void> {
    return this.backend.setValue(['questions'], question.id, [])
  }

  async getQuestions(): Promise<Question[]> {
    return [];
  }

  async getContentCount(): Promise<Number> {
    return 0;
  }

  async getContent<Content>(): Promise<Content> {
    return 0 as any;
  }

  async getContentMetadata(): Promise<ContentMetadata> {
    return 0 as any;
  }

  async close() { }
}
