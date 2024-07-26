
import docopt from "https://deno.land/x/docopt@v1.0.5/mod.ts";
import {
  JSONQuestionLoader,
  YamlQuestionLoader
} from "./src/load-questions.ts";
import { JSONContent } from "./src/load-content.ts";
import { RowTransformer } from "./src/types/index.ts";
import { linnaeusApp, linnaeusServices, startApp } from "./src/index.ts";
import { SqliteStorage } from "./src/storage.ts";

const doc = `
Usage:
  linnaeus label-json [-q=<qpath>|--questions=<qpath>] <input_path> <output_path>
  linnaeus (-h|--help)

Description:
  Linneaus is a keyboard-driven question-and-answer website for describing what's
  in a set of content. It helps users quickly fill in information for relevant
  questions.

Input Expectations:
  * Questions should be in a JSON or YAML file. They should be an array of objects, and
      each object should match the schema in the schema/questions.json file.
  * Content should in a JSON file, CSV file, or SQlite database. The content should
      be an array of items

Arguments:
  <input_path>    The path to the file, which contains to describe.
  <output_path>   The path to the output Sqlite database.

Options:
  -q=<qpath>, --questions=<qpath>  The path to the questions file. Can be yaml or JSON.
                                       Must be valid according to the schema.
  -h, --help                       Show this screen.

Examples:
  linnaeus label-json --questions=./myquestions.yaml 'mycontent.json' 'myanswers.db'
`;

/*
* Pick the right question loader based on the file extension. Note that the
* content format and question format aren't coupled; we need to check the
* file format of the questions seperately.
*
* @param fpath The path to the file to load questions from.
*/
function chooseQuestionLoader(fpath: string) {
  if (fpath.endsWith(".json")) {
    return JSONQuestionLoader;
  } else if (fpath.endsWith(".yaml")) {
    return YamlQuestionLoader;
  } else {
    throw new Error("Unknown file type");
  }
}

/*
 * Input content needs to be mapped onto a formal `Content` type.
 * This function constructs that mapping.
 *
 */
function chooseTransformer(): RowTransformer<string> {
  return (row: unknown[]) => {
    return {
      id: row[0] as string,
      type: row[1] as string,
      value: row[2] as string
    };
  }
}

const args = docopt(doc);
const $questionLoader = chooseQuestionLoader(args["--questions"]);
const $transformer = chooseTransformer();

const questionLoader = new $questionLoader(args["--questions"]) as JSONQuestionLoader<string>;
const contentLoader = new JSONContent(args["<input_path>"], $transformer);
const storage = new SqliteStorage<string>('.cli.db');

const services = await linnaeusServices<string>(
  contentLoader,
  questionLoader,
  storage
);
const config = {
  port: 5_000,
};

const app = linnaeusApp(services, config);
await startApp(app, config);
