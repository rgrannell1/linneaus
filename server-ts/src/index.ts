/*
 * This file exports the function that starts the server locally
 *
 */

import type {
  Config,
  IContentLoader,
  IQuestionLoader,
  Question,
  Services,
} from "./types/index.ts";
import { Application, oakCors, Router } from "./deps.ts";
import { SqliteStorage } from "./storage.ts";
import {
  getAnswer,
  getAnswerCount,
  getContent,
  getContentCount,
  getQuestions,
  setAnswer,
} from "./routes.ts";

/*
 * Load services for Linneaues
 *
 * @params contentLoader - a class that implements IContentLoader
 * @params questionsLoader - a class that implements IQuestionLoader
 *
 * @returns The services for Linnaeus
 */
export async function linnaeusServices<Content>(
  contentLoader: IContentLoader<Content>,
  questionsLoader: IQuestionLoader<Question<Content>>,
): Promise<Services<Content>> {
  const storage = new SqliteStorage<Content>();
  await storage.init(questionsLoader as any);

  return {
    storage,
    contentLoader,
    questionsLoader,
  };
}

/*
 * Create the router
 *
 * @params services - The services for Linnaeus
 * @params config - The configuration for Linnaeus
 *
 * @returns The router for Linnaeus
 */
export function linnaeusRouter<Content>(
  services: Services<Content>,
  config: Config,
): Router {
  const router = new Router();

  router
    .get(
      '/questions',
      oakCors(),
      getQuestions(config, services),
    )
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
      "/answers/:questionId/count",
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

/*
 * Create the application
 *
 * @params services - The services for Linnaeus
 * @params config - The configuration for Linnaeus
 *
 * @returns The application for Linnaeus
 */
export function linnaeusApp<Content>(services: Services<Content>, config: Config): Application {
  const router = linnaeusRouter(services, config);
  const app = new Application();

  app
    .use(oakCors())
    .use(router.routes())
    .use(router.allowedMethods());

  return app;
}

/*
 * Start the application
 *
 * @params app - The application to start
 * @params services - The services for Linnaeus
 *
 * @returns The controller for the application
 */
export async function startApp<Content>(
  app: Application,
  services: Services<Content>,
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
