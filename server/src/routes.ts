/*
 * API route implementations
 */

import { send } from "./deps.ts";
import { Answer } from "./types/index.ts";

/*
 * GET /questions
 *
 * Get questions
 */
export function getQuestions(_, services) {
  const {
    questionsLoader,
  } = services;

  return async function (ctx: any) {
    ctx.response.body = await Array.fromAsync(questionsLoader.getQuestions());
  };
}

/*
 * GET /content/:questionId/count
 *
 * Get the number of content items relevant to a question.
 */
export function getContentCount(_, services) {
  const {
    storage,
    contentLoader,
    questionsLoader,
  } = services;

  return async function (ctx: any) {
    const { questionId } = ctx.params;
    const [
      content,
      questions,
      answers,
    ] = await Promise.all([
      Array.fromAsync(contentLoader.getContent()),
      Array.fromAsync(questionsLoader.getQuestions()),
      Array.fromAsync(storage.getAnswers(questionId)),
    ]);

    const question = questions.find((question) => question.id === questionId);
    if (!question) {
      ctx.response.status = 404;
      ctx.response.body = JSON.stringify({
        error: `No question with ID ${questionId} found`,
      });
      return;
    }

    ctx.response.body = {
      count: question.relevantContent(content, answers).length,
    };
  };
}

/*
 * POST /answers/:questionId/content/:index
 *
 * Set the answer to a question for a specific content item
 */
export function setAnswer(_, services) {
  const {
    storage,
    contentLoader,
    questionsLoader,
  } = services;

  return async function (ctx: any) {
    const { questionId, index } = ctx.params;
    const { answer } = ctx.request.body;

    const [
      content,
      questions,
      answers,
    ] = await Promise.all([
      Array.fromAsync(contentLoader.getContent()),
      Array.fromAsync(questionsLoader.getQuestions()),
      Array.fromAsync(storage.getAnswers(questionId)),
    ]);

    const question = questions.find((question) => question.id === questionId);
    if (!question) {
      ctx.response.status = 404;
      ctx.response.body = JSON.stringify({
        error: `No question with ID ${questionId} found`,
      });
      return;
    }

    const eligableContent = question.relevantContent(content, answers);
    const selectedContent = eligableContent[index];
    if (!selectedContent) {
      ctx.response.status = 404;
      ctx.response.body = JSON.stringify({
        error: `No content found at index ${index}`,
      });
      return;
    }

    const contentId = selectedContent.id ?? selectedContent;
    if (!contentId) {
      ctx.response.status = 400;
      ctx.response.body = JSON.stringify({
        error: "Content must have an id property",
      });
      return;
    }

    await storage.setAnswer({ questionId, contentId, answer });
  };
}

/*
 * GET /answers/:questionId/content/:contentId
 *
 * Get the answer to a question for a specific content item
 */
export function getAnswer(_, services) {
  const {
    storage,
    contentLoader,
    questionsLoader,
  } = services;

  return async function (ctx: any) {
    const { questionId, index } = ctx.params;

    const [
      content,
      questions,
      answers,
    ] = await Promise.all([
      Array.fromAsync(contentLoader.getContent()),
      Array.fromAsync(questionsLoader.getQuestions()),
      Array.fromAsync(storage.getAnswers(questionId)),
    ]) as [unknown[], unknown[], Answer[]];

    const question = questions.find((question) => question.id === questionId);
    if (!question) {
      ctx.response.status = 404;
      ctx.response.body = JSON.stringify({
        error: `No question with ID ${questionId} found`,
      });
      return;
    }

    const selectedContent = content[index];
    if (!selectedContent) {
      ctx.response.status = 404;
      ctx.response.body = JSON.stringify({
        error: `No content at index ${index} found`,
      });
      return;
    }

    const answer = answers.find((answer: Answer) => {
      return answer.contentId === selectedContent &&
        answer.questionId === questionId;
    });

    if (!answer) {
      ctx.response.status = 200;
      ctx.response.body = JSON.stringify({
        error:
          `No answer found for question ${questionId} and content ${selectedContent}`,
      });
      return;
    }

    ctx.response.body = JSON.stringify({
      contentId: selectedContent,
      questionId,
      answer: answer.answer,
    });
  };
}

/*
 * GET /answers/:questionId/contentCount
 *
 * Get the number of answers for a question
 */
export function getAnswerCount(_, services) {
  const {
    storage,
    questionsLoader,
  } = services;

  return async function (ctx: any) {
    const { questionId } = ctx.params;

    const [
      questions,
      answers,
    ] = await Promise.all([
      Array.fromAsync(questionsLoader.getQuestions()),
      Array.fromAsync(storage.getAnswers(questionId)),
    ]);

    const question = questions.find((question) => question.id === questionId);
    if (!question) {
      ctx.response.status = 404;
      ctx.response.body = JSON.stringify({
        error: `No question with ID ${questionId} found`,
      });
      return;
    }

    ctx.response.body = {
      count:
        answers.filter((answer) => answer.questionId === questionId).length,
    };
  };
}

/*
 * GET /content/:contentId
 *
 * Get a specific content item
 */
export function getContent(_, services) {
  const {
    contentLoader,
  } = services;

  return async function (ctx: any) {
    const { index } = ctx.params;
    const qs = new URLSearchParams(ctx.request.url.search);

    const contentList = await Array.fromAsync(contentLoader.getContent());
    const selectedContent = contentList[index];
    if (!selectedContent) {
      ctx.response.status = 404;
      ctx.response.body = JSON.stringify({
        error: `No content with ID ${index} found`,
      });
      return;
    }

    if (qs.get("mode") === "photo") {
      await ctx.send({
        root: "/",
        path: selectedContent,
      });
    } else {
      ctx.response.body = selectedContent;
    }
  };
}

export function staticFiles(dpath: string) {
  return async function (ctx: any, next) {
    const fpath = ctx.request.url.pathname;

    for (const nonStatic of ["/questions", "/content", "/answers"]) {
      if (fpath.startsWith(nonStatic)) {
        return await next();
      }
    }

    await send(ctx, ctx.request.url.pathname, {
      root: dpath,
    });
  };
}
