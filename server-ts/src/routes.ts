/*
 * API route implementations
 *
 */


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
  }
}

/*
 * GET /content/:questionId/count
 *
 * Get the number of content items relevant to a question.
 *
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
 * POST /answers/:questionId/content/:contentId
 *
 * Set the answer to a question for a specific content item
 */
export function setAnswer(_, services) {
  const {
    storage,
  } = services;

  return async function (ctx: any) {
    const { questionId, contentId } = ctx.params;
    const { answer } = ctx.request.body;

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
    const { questionId, contentId } = ctx.params;

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

    const contentItem = content.find((content) => content.id === contentId);
    if (!contentItem) {
      ctx.response.status = 404;
      ctx.response.body = JSON.stringify({
        error: `No content with ID ${contentId} found`,
      });
      return;
    }

    const answer = answers.find((answer) => {
      return answer.contentId === contentId && answer.questionId === questionId;
    });

    if (!answer) {
      ctx.response.status = 404;
      ctx.response.body = JSON.stringify({
        error:
          `No answer found for question ${questionId} and content ${contentId}`,
      });
      return;
    }

    ctx.response.body = JSON.stringify({
      contentId,
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
    contentLoader,
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
    const { contentId } = ctx.params;
    const contentList = await Array.fromAsync(contentLoader.getContent());

    const content = contentList.find((content) => content.id === contentId);
    if (!content) {
      ctx.response.status = 404;
      ctx.response.body = JSON.stringify({
        error: `No content with ID ${contentId} found`,
      });
      return;
    }

    ctx.response.body = content;
  };
}
