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
  relevantContent: Filters.allContent<PhotoContent>(),
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
  relevantContent: Filters.answeredQuestion<PhotoContent>("q01", "Wildlife"),
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

const q03 = {
  id: "q03",
  type: "pick-one",
  relevantContent: Filters.answeredQuestion<PhotoContent>("q01", "Wildlife"),
  text: "What conditions did these animals live in?",
  choices: [
    "Captivity",
    "Wild",
    "Unsure",
    "Other",
  ],
};


const q03_05 = {
  id: "q03_05",
  type: "pick-one",
  relevantContent: Filters.answeredQuestion<PhotoContent>("q01", "Wildlife"),
  text: "What conditions did these animals live in?",
  choices: [
    "Captivity",
    "Wild",
    "Unsure",
    "Other",
  ],
};

const q04 = {
  id: "q04",
  type: "pick-one",
  relevantContent: Filters.answeredQuestion<PhotoContent>("q02", "Amphibian"),
  text: "What type of amphibian is this?",
  choices: [
    "Frog",
    "Toad",
    "Salamander",
    "Newt",
    "Caecilian",
    "Unsure",
    "Other",
  ],
};

const q05 = {
  id: "q05",
  type: "pick-one",
  relevantContent: Filters.allContent<PhotoContent>(),
  text: "Rate these photos in aesthetic terms",
  choices: [
    "⭐",
    "⭐⭐",
    "⭐⭐⭐",
    "⭐⭐⭐⭐",
    "⭐⭐⭐⭐⭐",
  ],
};

const q06 = {
  id: "q06",
  type: "pick-one",
  relevantContent: Filters.answeredQuestion<PhotoContent>("q02", "Bird"),
  text: "Is the subject bird in flight?",
  choices: [
    "Yes",
    "No",
    "Unsure",
    "Other",
  ],
};

const q07 = {
  id: "q07",
  type: "pick-one",
  relevantContent: Filters.allContent<PhotoContent>(),
  text: "Is a body of water a significant figure in this image?",
  choices: [
    "Yes",
    "No",
    "Unsure",
    "Other",
  ],
};

const q08 = {
  id: "q08",
  type: "pick-one",
  relevantContent: Filters.answeredQuestion<PhotoContent>("q07", "Yes"),
  text: "What type of body of water is this?",
  choices: [
    "Ocean or Sea",
    "Lake",
    "River or Stream",
    "Pond",
    "Puddle",
    "Other",
    "Unsure"
  ],
};

const q09 = {
  id: "q09",
  type: "pick-one",
  relevantContent: Filters.answeredQuestion<PhotoContent>("q01", "Cityscape"),
  text: "What is the primary subject of this cityscape photo?",
  choices: [
    "Statue",
    "General Architecture",
    "Notable Building",
    "Public Art or Graffiti",
    "Waterways",
    "Public Life",
    "General Ambiance",
    "Other",
    "Unsure"
  ],
};

const q10 = {
  id: "q10",
  type: "pick-one",
  relevantContent: Filters.answeredQuestion<PhotoContent>("q09", "Waterways"),
  text: "What type of waterway is the focus?",
  choices: [
    "Ocean or Sea",
    "Lake",
    "River or Stream",
    "Pond",
    "Puddle",
    "Other",
    "Unsure"
  ],
};

export const questionLoader = new LiteralQuestionLoader<PhotoContent>([
  q01,
  q02,
  q03,
  q03_05,
  q04,
  q05,
  q06,
  q07,
  q08,
  q09,
  q10
]);
