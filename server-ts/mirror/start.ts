/*
 * Mirror-specific content
 *
 */

import { startApp, linnaeusApp, linnaeusServices } from "../src/index.ts";
import { questionLoader } from "./questions.ts";
import { MirrorContentLoader } from "./mirror.ts";
import type { PhotoContent } from "./mirror.ts";

const contentLoader = new MirrorContentLoader();
const services = await linnaeusServices<PhotoContent>(
  contentLoader,
  questionLoader,
);
const config = {
  port: 5_000,
};

const app = linnaeusApp(services, config);
await startApp(app, services, config);
