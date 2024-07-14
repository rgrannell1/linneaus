
import os
import sqlite3
from flask import Flask, send_from_directory, request
from flask_cors import CORS
from typing import Optional

from questions import Question, questions

QUESTION_TABLE = """
create table if not exists questions (
  question_id    text primary key,
  depends_on     text,
  question       text,
  type           text,
  choices        text
);
"""

ANSWERS_TABLE = """
create table if not exists answers (
  fpath          text,
  question_id    text,
  answer         text,

  primary key(fpath, question_id)
);
"""


class Database:
  TABLES = { QUESTION_TABLE, ANSWERS_TABLE }

  def __init__(self, db_path: str):
    self.db_path = db_path
    self.conn = sqlite3.connect(db_path, check_same_thread=False)

  def create(self):
    cursor = self.conn.cursor()

    for table in Database.TABLES:
      cursor.execute(table)

  def list_publishable(self):
    cursor = self.conn.cursor()
    cursor.execute("""
    select fpath from images where published = '1'
    order by fpath
    """)

    for row in cursor.fetchall():
      yield row[0]

  def add_question(self, question: Question):
    cursor = self.conn.cursor()
    cursor.execute(
      "insert or replace into questions values (?, ?, ?, ?, ?)",
      (question.question_id, ','.join(question.depends_on), question.question, question.type, ','.join(question.choices))
    )

    self.conn.commit()

  def get_answer_count(self, question_id):
    cursor = self.conn.cursor()
    cursor.execute(
      "select count(*) from answers where question_id = ?",
      (question_id,))

    answer = cursor.fetchone()
    return answer[0]

  def add_answer(self, fpath, question_id, option):
    cursor = self.conn.cursor()
    cursor.execute(
      "insert or replace into answers (fpath, question_id, answer) values (?, ?, ?)",
      (fpath, question_id, option))

    self.conn.commit()

  def get_question(self, question_id) -> Optional[Question]:
    cursor = self.conn.cursor()
    cursor.execute("select * from questions where question_id = ?", (question_id,))

    question = cursor.fetchone()
    if not question:
      return None

    return Question(
      question_id=question[0],
      depends_on=question[1].split(','),
      question=question[2],
      type=question[3],
      choices=question[4].split(',')
    )

  def get_answer(self, fpath, question):
    cursor = self.conn.cursor()
    cursor.execute(
      "select answer from answers where fpath = ? and question_id = ?",
      (fpath, question))

    answer = cursor.fetchone()

    if answer:
      return answer[0]
    else:
      return None

  def get_image_with_answer(self, question_id, answer):
    cursor = self.conn.cursor()
    cursor.execute(
      """
      select fpath from answers where question_id = ? and answer = ?
      order by fpath
      """,
      (question_id, answer))

    for row in cursor.fetchall():
      yield row[0]
