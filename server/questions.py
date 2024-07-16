
from typing import List
from dataclasses import dataclass


@dataclass
class Question:
  question_id: str
  depends_on: List[str]
  question: str
  type: str
  choices: List[str]


q01 = Question(
  question_id="q01",
  depends_on=[],
  question="What style is this photo?",
  type="pick-one",
  choices=[
    'Wildlife',
    'Landscape',
    'Cityscape',
    'Transport',
    'Other'
  ]
)

q02 = Question(
  question_id="q02",
  depends_on=["q01:Wildlife"],
  question="What wildlife is the subject of this photo?",
  type="pick-one",
  choices=[
    "Bird",
    "Mammal",
    "Reptile",
    "Fish",
    "Amphibian",
    "Arthropod",
    "Multiple",
    "Other"
  ]
)

q03 = Question(
  question_id="q03",
  depends_on=["q01:Wildlife"],
  question="What conditions did these animals live in?",
  type="pick-one",
  choices=[
    "Captivity",
    "Wild",
    "Unsure",
    "Other"
  ]
)

q03_5 = Question(
  question_id="q03_5",
  depends_on=["q03:Unsure"],
  question="What conditions did these animals live in?",
  type="pick-one",
  choices=[
    "Captivity",
    "Wild",
    "Unsure",
    "Other"
  ]
)

q04 = Question(
  question_id="q04",
  depends_on=["q02:Amphibian"],
  question="What type of amphibian is this?",
  type="pick-one",
  choices=[
    "Frog",
    "Toad",
    "Salamander",
    "Newt",
    "Caecilian",
    "Unsure",
    "Other",
  ]
)

q05 = Question(
  question_id="q05",
  depends_on=[],
  question="Rate these photos in aesthetic terms",
  type="pick-one",
  choices=[
    "⭐",
    "⭐⭐",
    "⭐⭐⭐",
    "⭐⭐⭐⭐",
    "⭐⭐⭐⭐⭐",
  ]
)

q06 = Question(
  question_id="q06",
  depends_on=["q02:Bird"],
  question="Is the subject bird in flight?",
  type="pick-one",
  choices=[
    "Yes",
    "No",
    "Unsure",
    "Other"
  ]
)

q07 = Question(
  question_id="q07",
  depends_on=[],
  question="Is a body of water a significant figure in this image?",
  type="pick-one",
  choices=[
    "Yes",
    "No",
    "Unsure",
    "Other"
  ]
)

q08 = Question(
  question_id="q08",
  depends_on=["q07:Yes"],
  question="What type of body of water is this?",
  type="pick-one",
  choices=[
    "Ocean or Sea",
    "Lake",
    "River or Stream",
    "Pond",
    "Puddle",
    "Other",
    "Unsure"
  ]
)

q09 = Question(
  question_id="q09",
  depends_on=["q01:Cityscape"],
  question="What is the primary subject of this cityscape photo?",
  type="pick-one",
  choices=[
    "Statue",
    "General Architecture",
    "Notable Building",
    "Public Art or Graffiti",
    "Waterways",
    "Public Life",
    "General Ambiance",
    "Other",
    "Unsure"
  ]
)

q10 = Question(
  question_id="q10",
  depends_on=["q09:Waterways"],
  question="What type of waterway is the focus?",
  type="pick-one",
  choices=[
    "Ocean or Sea",
    "Lake",
    "River or Stream",
    "Pond",
    "Puddle",
    "Other",
    "Unsure"
  ]
)

questions = [
  q01,
  q02,
  q03,
  q03_5,
  q04,
  q05,
  q06,
  q07,
  q08,
  q09,
  q10
]
