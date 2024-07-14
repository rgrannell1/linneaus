
def parse_dependency(db, question_dep):
  question_id, if_choice = question_dep.split(':', 1)
  question = db.get_question(question_id)

  index = question.choices.index(if_choice)
  return (question_id, index + 1)

class State():
  def __init__(self, db):
    self.db = db

  def images(self):
    question = self.db.get_question(self.question_id)
    if not question:
      raise ValueError(f"Question {self.question_id} not found")

    requirements = [
      parse_dependency(self.db, question_dep) for question_dep in
      question.depends_on
      if question_dep
    ]

    if not requirements:
      return list(self.db.list_publishable())

    common_elements = None

    for required_question_id, required_choice in requirements:
      # check the dependency answer matches up
      eligable = set(self.db.get_image_with_answer(required_question_id, required_choice))

      if common_elements is None:
        common_elements = eligable
      else:
        common_elements = common_elements.intersection(eligable)

    return [
      elem for elem in common_elements
    ]

  def set_question_id(self, question_id):
    self.question_id = question_id
