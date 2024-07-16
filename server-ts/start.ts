
import { whatsThisApp, whatsThisServices, startApp } from './index.ts';
import { questions } from './questions.ts';

type Content = string;
type ContentMetadata = {
  fpath: string;
}

const services = await whatsThisServices(questions);
const config = {
  port: 5000
}

const app = whatsThisApp({  }, {  });
await startApp<Content, ContentMetadata>(app, services, config)
