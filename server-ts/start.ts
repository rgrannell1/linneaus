// Mirror-Specific Code

import { startApp, whatsThisApp, whatsThisServices } from "./src/index.ts";
import { questionLoader } from "./questions.ts";
import { MirrorContentLoader } from "./mirror.ts";

type MirrorContent = {
  id: string;
  fpath: string;
};

const contentLoader = new MirrorContentLoader();

const services = await whatsThisServices(contentLoader, questionLoader);
const config = {
  port: 5_000,
};

const app = whatsThisApp(services, config);
await startApp<MirrorContent, MirrorContentMetadata>(app, services, config);
