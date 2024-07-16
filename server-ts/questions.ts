import { PickOneQuestion } from "./types/index.ts";

const q01: PickOneQuestion = {
  id: 'q01',
  type: 'pick-one',
  dependsOn: [],
  text: 'What style is this photo?',
  choices: [
    'Wildlife',
    'Landscape',
    'Cityscape',
    'Transport',
    'Other'
  ]
}

export const questions = [q01];
