/*
 * Mirror-specific questions
 *
 */

import * as Filters from "../src/filters.ts";
import { LiteralQuestionLoader } from "../src/load-questions.ts";

import type { PhotoContent } from "./mirror.ts";

const q01 = {
  id: "q01",
  type: "pick-one",
  relevantContent: Filters.allContent(),
  text: "What style is this photo?",
  choices: [
    "Wildlife",
    "Landscape",
    "Cityscape",
    "Transport",
    "Other",
  ],
};

const q02 = {
  id: "q02",
  type: "pick-one",
  relevantContent: Filters.answeredQuestion("q01", "Wildlife"),
  text: "What wildlife is the subject of this photo?",
  choices: [
    "Bird",
    "Mammal",
    "Reptile",
    "Fish",
    "Amphibian",
    "Arthropod",
    "Multiple",
    "Other",
  ],
};

export const questionLoader = new LiteralQuestionLoader<PhotoContent>([q01, q02]);
