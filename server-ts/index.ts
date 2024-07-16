
import type { Config, Question, Services } from './types/index.ts';
import { Application, oakCors, Router } from "./deps.ts";
import { WhatsItStorage } from "./storage.ts";
import {
  getQuestions,
  getContent,
  getContentMetadata,
  getContentCount,
  setAnswer,
  getAnswer,
  getAnswerCount
} from './routes.ts';
import { DenoKVBackend } from './backends/deno.ts';

export async function startApp<Content, ContentMetadata>(app, services: Services<Content, ContentMetadata>, config: Config) {
  const controller = new AbortController();

  app.listen({
    port: config.port,
    signal: config.signal
  });

  await Promise.all([
    services.storage.close()
  ])

  return controller;
}

export async function whatsThisServices(questions: Question[]) {
  const backend = new DenoKVBackend();
  await backend.init();

  const storage = new WhatsItStorage(backend);
  await storage.init(questions);

  return {
    storage,
    questions
  }
}

export function whatsThisRouter<Content, ContentMetadata>(services: Services<Content, ContentMetadata>, config: Config): Router {
  const router = new Router();

  router
    .get(
      '/questions',
      oakCors(),
      getQuestions(config, services))

  /*
    .get(
      '/content/:questionId/count',
      oakCors(),
      getContentCount(config, services))
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
  const router = whatsThisRouter(config, services);
  const app = new Application();

  app
    .use(oakCors())
    .use(router.routes())
    .use(router.allowedMethods());

  return app;
}
