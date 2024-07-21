/*
 * This file exports the function that starts the server locally
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
  logRoute,
  getAnswer,
  getAnswerCount,
  getContent,
  getContentCount,
  getQuestions,
  setAnswer,
  staticFiles,
} from "./routes.ts";
import { Ansi } from "./ansi.ts";

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
      "/questions",
      oakCors(),
      getQuestions(config, services),
    )
    .get(
      "/questions/:questionId/count",
      oakCors(),
      getContentCount(config, services),
    )
    .get(
      "/questions/:questionId/content/:index",
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
export function linnaeusApp<Content>(
  services: Services<Content>,
  config: Config,
): Application {
  const router = linnaeusRouter(services, config);
  const app = new Application();

  app
    .use(staticFiles(ROOT_DIR))
    .use(oakCors())
    .use(logRoute())
    .use(router.routes())
    .use(router.allowedMethods());

  return app;
}

const splashScreen = (config: Config) => `
🍃 \u001B]8;;http://localhost:${config.port}/index.html\u0007Linnaeus\u001B]8;;\u0007 🍃

~~ API ~~

GET ${Ansi.bold("/questions")}
  ${Ansi.green("List all questions")}
GET ${Ansi.bold("/questions/:questionId/count")}
  ${
  Ansi.green(
    "Get the number of content items eligable for a particular question",
  )
}
GET ${Ansi.bold("/content/:index")}
  ${Ansi.green("Get a particular content item")}
GET ${Ansi.bold("/answers/:questionId/content/:index")}
  ${Ansi.green("Get a answer for particular content and question")}
GET ${Ansi.bold("/answers/:questionId/count")}
  ${Ansi.green("Get the number of answers for a particular question")}
POST ${Ansi.bold("/answers/:questionId/content/:index")}
  ${Ansi.green("Set an answer for a particular content and question")}
`;

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

  console.error(splashScreen(config));

  return controller;
}
