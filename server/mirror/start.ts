/*
 * Mirror-specific content
 */

import { linnaeusApp, linnaeusServices, startApp } from "../src/index.ts";
import { questionLoader } from "./questions.ts";
import { MirrorContentLoader } from "./mirror.ts";
import type { PhotoContent } from "./mirror.ts";
import { SqliteStorage } from "../src/storage.ts";

const contentLoader = new MirrorContentLoader();
const storage = new SqliteStorage<PhotoContent>('.linnaeus.db');

const services = await linnaeusServices<PhotoContent>(
  contentLoader,
  questionLoader,
  storage
);
const config = {
  port: 5_000,
};

const app = linnaeusApp(services, config);
await startApp(app, config);
