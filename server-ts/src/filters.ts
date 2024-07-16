import { Answer, Content } from "./types";

export class Filters {
  /*
   * Return a filter function. The filter function will return only the content
   * with a question: answer associated
   */
  static questionAnswer(questionId: string, expectedAnswer: string) {
    return (content: Content[], answers: Answer[]): Content[] => {
      const matchingIds: Set<string> = new Set([]);

      for (const answer of answers) {
        if (answer.questionId === questionId && answer.answer === expectedAnswer) {
          matchingIds.add(answer.contentId);
        }
      }

      return content.filter(entry => {
        return matchingIds.has(entry.id)
      });
    }
  }

  static allContent() {
    return (content: Content[], _: Answer[]): Content[] => {
      return content;
    }
  }
}
