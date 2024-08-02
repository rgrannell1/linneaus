/*
 * API route implementations
 */

import { Ansi } from "./ansi.ts";
import { send } from "./deps.ts";
import { Answer } from "./types/index.ts";

export function logRoute() {
  return async function (ctx: any, next: any) {
    console.log(`${ctx.request.method} ${Ansi.bold(ctx.request.url.pathname)}`);
    await next();
  };
}

/*
 * GET /questions
 *
 * Get questions
 */
export function getQuestions(_, services) {
  const {
    cache,
  } = services;

  return async function (ctx: any) {
    ctx.response.body = await cache.getQuestions();
  };
}

export function getSuggestions(_, services) {
  const {
    storage
  } = services;

  return async function (ctx: any) {
    const { questionId } = ctx.params;

    const suggestions = await Array.fromAsync(storage.getSuggestions(questionId));
    ctx.response.body = suggestions;
  }
}

/*
 * GET /content/:questionId/count
 *
 * Get the number of content items relevant to a question.
 */
export function getContentCount(_, services) {
  const {
    cache,
  } = services;

  return async function (ctx: any) {
    const { questionId } = ctx.params;

    const [
      content,
      questions,
      answers,
    ] = await Promise.all([
      cache.getContent(),
      cache.getQuestions(),
      cache.getAnswers(),
    ]);

    const question = questions.find((question) => question.id === questionId);
    if (!question) {
      ctx.response.status = 404;
      ctx.response.body = JSON.stringify({
        error: `No question with ID ${questionId} found`,
      });
      return;
    }

    const count = question.relevantContent(content, answers).length;
    ctx.response.body = JSON.stringify({
      count,
    });
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
    cache,
  } = services;

  return async function (ctx: any) {
    const { questionId, index } = ctx.params;

    const [
      content,
      questions,
      answers,
    ] = await Promise.all([
      cache.getContent(),
      cache.getQuestions(),
      cache.getAnswers(),
    ]);

    if (!ctx.request.hasBody) {
      ctx.response.status = 415;
      ctx.response.body = JSON.stringify({
        error: `No request body `,
      });
    }

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

    const { option, choice } = await ctx.request.body().value;
    await storage.setAnswer({
      questionId,
      contentId,
      answerId: option,
      answer: choice,
    });
  };
}

/*
 * GET /answers/:questionId/content/:contentId
 *
 * Get the answer to a question for a specific content item
 */
export function getAnswer(_, services) {
  const {
    cache,
  } = services;

  return async function (ctx: any) {
    const { questionId, index } = ctx.params;

    const [
      content,
      questions,
      answers,
    ] = await Promise.all([
      cache.getContent(),
      cache.getQuestions(),
      cache.getAnswers(),
    ]);

    const question = questions.find((question) => question.id === questionId);
    if (!question) {
      ctx.response.status = 404;
      ctx.response.body = JSON.stringify({
        error: `No question with ID ${questionId} found`,
      });
      return;
    }

    const contentList = question.relevantContent(content, answers);

    const selectedContent = contentList[index];
    if (!selectedContent) {
      ctx.response.status = 404;
      ctx.response.body = JSON.stringify({
        error: `No content with ID ${index} found`,
      });
      return;
    }

    const answer = answers.find((answer: Answer) => {
      return answer.contentId === selectedContent.id &&
        answer.questionId === questionId;
    });

    if (!answer) {
      ctx.response.status = 200;
      ctx.response.body = JSON.stringify({
        error:
          `No answer found for question ${questionId} and content ${selectedContent.id}`,
      });
      return;
    }

    if (question.type === "pick-one") {
      ctx.response.body = JSON.stringify({
        contentId: selectedContent.id,
        questionId,
        answer: answer.answerId,
      });
    } else if (question.type === "free-text") {
      ctx.response.body = JSON.stringify({
        contentId: selectedContent.id,
        questionId,
        answer: answer.answer,
      });
    } else if (question.type === "tags") {
      ctx.response.body = JSON.stringify({
        contentId: selectedContent.id,
        questionId,
        answer: answer.answer.split(',').filter(tag => tag.trim()),
      });
    } else {
      ctx.response.status = 500;
      ctx.response.body = JSON.stringify({
        error: `Unknown question type ${question.type}`,
      });
    }
  };
}

export function getUnanswered(_, services) {
  const {
    cache,
  } = services;

  return async function (ctx: any) {
    const { questionId, startIndex } = ctx.params;

    const [
      content,
      questions,
      answers,
    ] = await Promise.all([
      cache.getContent(),
      cache.getQuestions(),
      cache.getAnswers(),
    ]);

    const question = questions.find((question) => question.id === questionId);
    if (!question) {
      ctx.response.status = 404;
      ctx.response.body = JSON.stringify({
        error: `No question with ID ${questionId} found`,
      });
      return;
    }

    const contentList = question.relevantContent(content, answers);

    if (!contentList) {
      ctx.response.status = 404;
      ctx.response.body = JSON.stringify({
        error: `No content found`,
      });
      return;
    }

    const answeredSet = new Set(answers.filter((answer: Answer) => {
      return answer.contentId && answer.questionId === questionId;
    }).map((answer: Answer) => answer.contentId));

    let idx = 0; // bad
    for (const content of contentList.slice(startIndex ?? 0)) {
      if (!answeredSet.has(content.id)) {
        ctx.response.body = JSON.stringify({
          index: idx,
          questionId,
        });
        return;
      }
      idx++;
    }

    ctx.response.status = 404;
    ctx.response.body = JSON.stringify({
      error: `No unanswered content found after index ${startIndex ?? 0}`,
      index: -1
    });

    return
  };
}

/*
 * GET /answers/:questionId/contentCount
 *
 * Get the number of answers for a question
 */
export function getAnswerCount(_, services) {
  const {
    cache,
  } = services;

  return async function (ctx: any) {
    const { questionId } = ctx.params;

    const [
      questions,
      answers,
    ] = await Promise.all([
      cache.getQuestions(),
      cache.getAnswers(),
    ]);

    const question = questions.find((question) => question.id === questionId);
    if (!question) {
      ctx.response.status = 404;
      ctx.response.body = JSON.stringify({
        error: `No question with ID ${questionId} found`,
      });
      return;
    }

    ctx.response.body = JSON.stringify({
      count: answers.filter((answer) =>
        answer.questionId === questionId
      ).length,
    });
  };
}

/*
 * GET /content/:contentId
 *
 * Get a specific content item
 */
export function getContent(_, services) {
  const {
    cache,
  } = services;

  return async function (ctx: any) {
    const { questionId, index } = ctx.params;
    const qs = new URLSearchParams(ctx.request.url.search);

    const [
      content,
      questions,
      answers,
    ] = await Promise.all([
      cache.getContent(),
      cache.getQuestions(),
      cache.getAnswers(),
    ]);

    const question = questions.find((question) => question.id === questionId);
    if (!question) {
      ctx.response.status = 404;
      ctx.response.body = JSON.stringify({
        error: `No question with ID ${questionId} found`,
      });
      return;
    }

    const contentList = question.relevantContent(content, answers);
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
        path: selectedContent.value,
      });
    } else {
      ctx.response.body = selectedContent.value;
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
      index: "index.html",
    });
  };
}

export function checkOnline() {
  return async function (ctx: any) {
    ctx.response.body = JSON.stringify({
      status: "ok",
    });
  };
}
