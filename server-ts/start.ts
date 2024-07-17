// Mirror-Specific Code

import { startApp, whatsThisApp, whatsThisServices } from "./src/index.ts";
import { questions } from "./questions.ts";
import { MirrorContentLoader } from "./mirror.ts";

type MirrorContent = {
  id: string;
  fpath: string;
};

type MirrorContentMetadata = {
  fpath: string;
};

const contentLoader = new MirrorContentLoader();

const services = await whatsThisServices(contentLoader, questions);
const config = {
  port: 5_000,
};

const app = whatsThisApp(services, config);
await startApp<MirrorContent, MirrorContentMetadata>(app, services, config);
