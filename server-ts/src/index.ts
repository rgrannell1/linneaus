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
  setAnswer,
} from "./routes.ts";

export async function startApp (
  app,
  services: Services,
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
  services: Services,
  config: Config,
): Router {
  const router = new Router();

  router
    .get(
      "/questions/:questionId/contentCount",
      oakCors(),
      getContentCount(config, services),
    )
    .get(
      "/content/:contentId",
      oakCors(),
      getContent(config, services),
    )
    .get(
      "/answers/:questionId/content/:contentId",
      oakCors(),
      getAnswer(config, services),
    )
    .get(
      "/answers/:questionId/contentCount",
      oakCors(),
      getAnswerCount(config, services),
    )
    .post(
      "/answers/:questionId/content/:contentId",
      oakCors(),
      setAnswer(config, services),
    );

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
