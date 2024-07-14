
import { API } from "./api.js";
import { Background } from "./background.js";
import { Keys } from "./constants.js";

const api = new API();
const background = new Background();

class App {
  constructor(questions) {
    this.index = 0;
    this.questionIndex = 0;
    this.questions = questions;
  }

  selectedQuestion() {
    return this.questions[this.questionIndex];
  }

  async onImageLoad() {
    const question = this.selectedQuestion();

    $('#photo-index').text(this.index);
    $('#preview-image').attr('src', API.photoUrl(this.index));
    this.drawOptionsList();
    this.renderFilename();

    const { answer } = await api.getAnswer(this.index, question.question_id);

    if (answer) {
      this.selectAnswer(answer);
    }
  }

  async onQuestionChange() {
    this.updateQuestion();
    this.drawOptionsList();
    this.updateAnsweredCount();
    this.updatePhotoCount();

    await this.capPhotoIndex();
    await this.onImageLoad();
  }

  async onUp() {
    this.questionIndex++;
    if (this.questionIndex >= this.questions.length) {
      this.questionIndex = 0;
    }

    await this.onQuestionChange();
    background.setNextBackground();
  }
  async onDown() {
    this.questionIndex--;
    if (this.questionIndex < 0) {
      this.questionIndex = this.questions.length - 1;
    }

    await this.onQuestionChange();
    background.setPreviousBackground();
  }

  async onLeft() {
    this.index--;
    const question = this.selectedQuestion();

    if (this.index < 0) {
      this.index = await api.photoCount(question.question_id) - 1;
    }

    await this.onImageLoad();
  };
  async onRight() {
    this.index++;

    const question = this.selectedQuestion();

    if (this.index > await api.photoCount(question.question_id) - 1) {
      this.index = 0;
    }

    await this.onImageLoad();
  }

  async renderFilename() {
    const name = await api.info(this.index);

    $("#photo-path").text(name);
  }

  selectAnswer(option) {
    $('.answers-list li').each(li => {
      $(li).removeClass('selected');
    });

    $(`.answers-${option}`).addClass('selected');
  }

  async updateAnsweredCount() {
    const question = this.selectedQuestion();
    const {count} = await api.getAnswerCount(question.question_id)

    $('#photo-answered-count').text(count);

    const photoCount = await api.photoCount(question.question_id);
    const percentage = (count / photoCount) * 100

    if (percentage === 100) {
      $('#photo-answered-percentage').text(`🎉 100`);
    } else {
      $('#photo-answered-percentage').text(Math.round(percentage, 2));
    }

  }
  drawOptionsList() {
    const question = this.selectedQuestion();

    const ul = $('<ul></ul>');
    ul.toggleClass('answers-list');

    question.choices.forEach((option, idx) => {
      const answers = `answers answers-${idx + 1}`;
      const li = $(`<li class="${answers}"></li>`);
      li.html(`<span class="number-box">[${idx + 1}]</span> ${option}`);
      ul.append(li);
    });

    $('#options').html(ul);
    return ul;
  }
  updateQuestion() {
    const question = this.selectedQuestion();
    $('#question').text(`[${question.question_id}] ${question.question}`);
  }

  async updatePhotoCount() {
    const question = this.selectedQuestion();

    $('#photo-count').text(await api.photoCount(question.question_id));
  }

  async capPhotoIndex() {
    const count = await api.photoCount(this.selectedQuestion().question_id);
    if (this.index >= count) {
      this.index = count - 1;
    }
  }

  async saveAnswer(option, choice) {
    this.selectAnswer(option);

    const question = this.selectedQuestion()
    await api.saveAnswer(this.index, question.question_id, option, choice);
    await this.updateAnsweredCount();
  }
}


// start the app
$(document).ready(async function() {
  const {questions} = await api.getQuestions();

  const state = new App(questions);
  const question = state.selectedQuestion();

  if (question.type === "pick-one") {
    state.drawOptionsList();
  }

  state.updateQuestion();

  state.updatePhotoCount()
  await Promise.all([
    state.updateAnsweredCount(),
    state.onImageLoad()
  ]);

  $(window).bind('keydown', async function (event) {
    if (event.keyCode == Keys.LEFT) {
      await state.onLeft();
    } else if (event.keyCode == Keys.RIGHT || event.keyCode == Keys.ENTER) {
      await state.onRight();
    } else if (event.keyCode == Keys.UP) {
      await state.onUp();
    } else if (event.keyCode == Keys.DOWN) {
      await state.onDown();
    }

    const question = state.selectedQuestion();

    if (question.type === "pick-one") {
      for (let option = 1; option <= question.choices.length; option++) {
        if (event.keyCode == 48 + option) {
          await state.saveAnswer(option);
        }
      }
    }

  });
});
