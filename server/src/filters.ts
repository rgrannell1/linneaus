/*
 * Some questions only make sense depending on other questions. For example.
 *
 * - What countries have you visited?
 * - What's your favourite place to visit in Ireland?
 *
 * Only makes sense if 'Ireland' is in the first answer.
 *
 * This file provides filters to help you select questions that contextually make sense.
 */

import type { Answer, Question } from "./types/index.ts";

/*
 * Find content with a specific question answered, with the expected answer
 *
 * @param questionId - The question ID to filter by
 * @param expectedAnswer - The expected answer to filter by
 */
export function answeredQuestion<Content>(
  questionId: string,
  expectedAnswer: string,
) {
  return (_: Content[], answers: Answer[]): Content[] => {
    const matchingIds: Set<string> = new Set([]);

    for (const answer of answers) {
      if (
        answer.questionId === questionId && answer.answerId === expectedAnswer
      ) {
        matchingIds.add(answer.contentId);
      }
    }

    return Array.from(matchingIds) as Content[]; // TODO not generalisable
  };
}

/*
 * Return all content
 */
export function allContent<Content>() {
  return (content: Content[], _: Answer[]): Content[] => {
    return content;
  };
}

export class QuestionParts {
  static id<Content>(question: Question<Content>) {
    return question.id;
  }

  static choiceId<Content>(question: Question<Content>, text: string) {
    const index = question.choices.findIndex((choice) => choice === text);

    if (index === -1) {
      throw new Error(`Choice ${text} not found in question ${question.id}`);
    }

    return `${index + 1}`;
  }
}
