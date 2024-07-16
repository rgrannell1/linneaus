
import { Filters } from "./src/filters.ts";


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
  relevantContent: Filters.questionAnswer("q01", "Wildlife"),
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
}

export const questions = [q01, q02];
