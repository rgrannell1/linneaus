
export function getContentCount(config, services) {
  const {
    storage,
    content,
    questions,
  } = services;

  return async function (ctx: any) {
    const questionId = ctx.params.questionId;
    const question = questions.find((question) => question.id === questionId);
    const answers = await storage.getAnswers(questionId);

    if (!question) {
      ctx.response.status = 404;
      return;
    }

    ctx.response.body = {
      count: question.relevantContent(content, answers).length,
    };
  };
}

export function setAnswer(config, services) {
  return async function (ctx: any) {
  };
}

export function getAnswer(config, services) {
  return async function (ctx: any) {
  };
}

export function getAnswerCount(config, services) {
  return async function (ctx: any) {
  };
}

export function getContent(config, services) {
  return async function (ctx: any) {
  };
}

export function getContentMetadata(config, services) {
  return async function (ctx: any) {
  };
}
