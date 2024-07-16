
import os
from flask import Flask, send_from_directory, request
from flask_cors import CORS

from questions import Question
from database import Database
from state import State
from typing import List


class WhatsThisServer:
  def __init__(self, db: Database, questions: List[Question]):
    self.db = db
    self.questions = questions
    self.app = Flask(__name__)
    self.state = State(db)
    CORS(self.app)

  def run(self):
    self.db.create()

    first_question = self.questions[0]
    self.state.set_question_id(first_question.question_id)

    for question in self.questions:
      self.db.add_question(question)

    self._routes()
    self.app.run(debug=True, threaded=False)

  def _routes(self):
    @self.app.route('/questions')
    def get_questions():
      return {
        "questions": [ q.__dict__ for q in questions ]
      }

    @self.app.route('/photos/<question>/count')
    def photo_count(question):
      self.state.set_question_id(question)

      return str(len(self.state.images()))

    @self.app.route('/photos/<int:idx>/<question>/answer', methods=['POST'])
    def save_answer(idx, question):
      content = request.get_json()

      fpath = self.state.images()[idx]

      option = content['option']
      print(content)

      self.db.add_answer(fpath, question, option)
      return {
        "option": option
      }

    @self.app.route('/photos/<question>/answer_count')
    def get_answer_count(question):

      self.state.set_question_id(question)
      return {
        "count": self.db.get_answer_count(question)
      }

    @self.app.route('/photos/<int:idx>/<question>/answer')
    def get_answer(idx, question):
      fpath = self.state.images()[idx]
      self.state.set_question_id(question)

      return {
        "question": question,
        "answer": self.db.get_answer(fpath, question)
      }

    @self.app.route('/photos/<int:idx>')
    def serve_photo(idx):
      fpath = self.state.images()[idx]

      dpath = os.path.dirname(fpath)
      fname = os.path.basename(fpath)

      return send_from_directory(dpath, fname)

    @self.app.route('/photos/<int:idx>/info')
    def photo_info(idx):
      return self.state.images()[idx]


if __name__ == '__main__':
  from questions import questions

  DB_PATH = '/home/rg/.mirror-manifest.db'

  server = WhatsThisServer(Database(DB_PATH), questions)
  server.run()
