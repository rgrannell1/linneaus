
// Mirror-Specific Code

import { startApp, whatsThisApp, whatsThisServices } from "./src/index.ts";
import { questions } from "./questions.ts";
import { MirrorContent } from "./mirror.ts";

type Content = string;
type ContentMetadata = {
  fpath: string;
};

const input = new MirrorContent();
const content = await input.getContent();

const services = await whatsThisServices(content, questions);
const config = {
  port: 5_000,
};

const app = whatsThisApp(services, config);
await startApp<Content, ContentMetadata>(app, services, config);
