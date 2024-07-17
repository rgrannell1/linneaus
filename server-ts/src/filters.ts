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

import { Answer, Content } from "./types/index.ts";

/*
 * Find content with a specific question answered, with the expected answer
 */
export function answeredQuestion(questionId: string, expectedAnswer: string) {
  return (content: Content[], answers: Answer[]): Content[] => {
    const matchingIds: Set<string> = new Set([]);

    for (const answer of answers) {
      if (
        answer.questionId === questionId && answer.answer === expectedAnswer
      ) {
        matchingIds.add(answer.contentId);
      }
    }

    return content.filter((entry) => {
      return matchingIds.has(entry.id);
    });
  };
}

/*
 * Return all content
 */
export function allContent() {
  return (content: Content[], _: Answer[]): Content[] => {
    return content;
  };
}
