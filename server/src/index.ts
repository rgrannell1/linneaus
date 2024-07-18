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
  staticFiles
} from "./routes.ts";

const ROOT_DIR = `${Deno.cwd()}/static`;

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
      "/content/:index",
      oakCors(),
      getContent(config, services),
    )
    .get(
      "/answers/:questionId/content/:index",
      oakCors(),
      getAnswer(config, services),
    )
    .get(
      "/answers/:questionId/count",
      oakCors(),
      getAnswerCount(config, services),
    )
    .post(
      "/answers/:questionId/content/:index",
      oakCors(),
      setAnswer(config, services),
    )

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
    .use(staticFiles(ROOT_DIR))
    .use(oakCors())
    .use(router.routes())
    .use(router.allowedMethods())

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
  config: Config,
) {
  const controller = new AbortController();

  app.listen({
    port: config.port,
    signal: config.signal,
  });

  console.error(`[linnaeus] Listening on http://localhost:${config.port}`);

  return controller;
}
