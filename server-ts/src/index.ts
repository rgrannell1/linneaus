import type {
  Config,
  IContentLoader,
  IQuestionLoader,
  Services,
} from "./types/index.ts";
import { Application, oakCors, Router } from "./deps.ts";
import { SqliteStorage } from "./storage.ts";
import {
  getAnswer,
  getAnswerCount,
  getContent,
  getContentCount,
  getContentMetadata,
  setAnswer,
} from "./routes.ts";

export async function startApp<Content, ContentMetadata>(
  app,
  services: Services<Content, ContentMetadata>,
  config: Config,
) {
  const controller = new AbortController();

  app.listen({
    port: config.port,
    signal: config.signal,
  });

  await Promise.all([
    services.storage.close(),
  ]);

  return controller;
}

export async function whatsThisServices<Content, Question>(
  contentLoader: IContentLoader<Content>,
  questionsLoader: IQuestionLoader<Question>,
) {
  const storage = new SqliteStorage();
  await storage.init(questionsLoader as any);

  return {
    storage,
    contentLoader,
    questionsLoader,
  };
}

export function whatsThisRouter<Content, ContentMetadata>(
  services: Services<Content, ContentMetadata>,
  config: Config,
): Router {
  const router = new Router();

  router
    .get(
      "/content/:questionId/count",
      oakCors(),
      getContentCount(config, services),
    );
  /*
    .post(
      '/content/:index/:questionId/answer',
      oakCors(),
      setAnswer(config, services))
    .get(
      '/content/:index/:questionId/answer',
      oakCors(),
      getAnswer(config, services))
    .get(
      '/content/:questionId/answer/count',
      oakCors(),
      getAnswerCount(config, services))
    .get(
      '/content/:index',
      oakCors(),
      getContent(config, services))
    .get(
      '/content/:index/metadata',
      oakCors(),
      getContentMetadata(config, services))
      */
  return router;
}

export function whatsThisApp(services, config) {
  const router = whatsThisRouter(services, config);
  const app = new Application();

  app
    .use(oakCors())
    .use(router.routes())
    .use(router.allowedMethods());

  return app;
}
