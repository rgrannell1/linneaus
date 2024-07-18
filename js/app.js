import { html, LitElement } from "/js/library/lit.js";
import { API } from "/js/api.js";
import { Keys } from "/js/constants.js";

const BACKGROUNDS = [
  "#7ED7C1",
  "#957ED7",
  "#D77E94",
  "#C1D77E",
];

export class LitElem extends LitElement {
  createRenderRoot() {
    return this;
  }

  broadcast(label, detail) {
    return () => {
      const dispatched = new CustomEvent(label, {
        detail,
        bubbles: true,
        composed: true,
      });

      this.dispatchEvent(dispatched);
    };
  }
}

export class LinneausApp extends LitElem {
  static get properties() {
    return {
      imageUrl: {
        type: String,
        state: true,
      },
      imagePath: {
        type: String,
        state: true,
      },
      questions: {
        type: Array,
        state: true,
      },
      questionIndex: {
        type: Number,
        state: true,
      },
      photoCount: {
        type: Number,
        state: true,
      },
      photoIndex: {
        type: Number,
        state: true,
      },
      questionsAnswered: {
        type: Number,
        state: true,
      },
      selectedOption: {
        type: Number,
        state: true,
      },
    };
  }

  constructor() {
    super();
    this.imageUrl = "";
    this.questions = [];
    this.questionIndex = 0;
    this.photoCount = 0;
    this.photoIndex = 0;
    this.questionsAnswered = 0;

    this.api = new API();
  }

  connectedCallback() {
    super.connectedCallback();
    addEventListener("keydown", this.handleKeyDown.bind(this));

    this.loadQuestions()
      .then(() => this.loadPhotoCount())
      .then(() => this.loadAnsweredCount())
      .then(() => this.loadFileInfo());
  }

  async loadQuestions() {
    const { questions } = await this.api.getQuestions();
    this.questions = questions;
  }

  async loadPhotoCount() {
    const question = this.questions[this.questionIndex];
    this.photoCount = await this.api.photoCount(question.question_id);
  }

  async loadAnsweredCount() {
    const question = this.questions[this.questionIndex];
    const { count } = await this.api.getAnswerCount(question.question_id);
    this.questionsAnswered = count;
  }

  async loadAnswer() {
    const question = this.questions[this.questionIndex];
    const answer = await this.api.getAnswer(
      this.photoIndex,
      question.question_id,
    );

    if (answer) {
      this.selectedOption = parseInt(answer.answer, 10);
    }
  }

  async loadFileInfo() {
    const name = await this.api.info(this.photoIndex);

    this.imagePath = name;
  }

  async saveAnswer(option) {
    const question = this.questions[this.questionIndex];

    return this.api.saveAnswer(
      this.photoIndex,
      question.question_id,
      option,
      question.choices[option - 1],
    );
  }

  renderNavigationInstructions() {
    return html`
      <p class="navigation-guide">Navigate between photos with ←, →</p>
      <p class="navigation-guide">Navigate between questions with ↑, ↓</p>
    `;
  }

  renderContent() {
    const url = API.photoUrl(this.photoIndex);

    return html`
    <image width="600" id="preview-image" src="${url}"></image>
    `;
  }

  onUp() {
    this.questionIndex--;
    if (this.questionIndex < 0) {
      this.questionIndex = this.questions.length - 1;
    }

    this.loadPhotoCount().then(() => {
      if (this.photoIndex > this.photoCount - 1) {
        this.photoIndex = this.photoCount - 1;
      }
    });
    this.loadAnsweredCount();
    this.loadAnswer();

    if (this.photoIndex > this.photoCount - 1) {
      this.photoIndex = this.photoCount - 1;
    }
  }

  onDown() {
    this.questionIndex++;
    if (this.questionIndex >= this.questions.length) {
      this.questionIndex = 0;
    }

    this.loadPhotoCount().then(() => {
      if (this.photoIndex > this.photoCount - 1) {
        this.photoIndex = this.photoCount - 1;
      }
    });

    this.loadAnsweredCount();
    this.loadAnswer();
  }

  onLeft() {
    this.photoIndex--;

    if (this.photoIndex < 0) {
      this.photoIndex = this.photoCount - 1;
    }

    this.loadFileInfo();
    this.loadAnswer();
  }

  onRight() {
    this.photoIndex++;

    if (this.photoIndex > this.photoCount - 1) {
      this.photoIndex = 0;
    }

    this.loadFileInfo();
    this.loadAnswer();
  }

  handlePickOneKeypress(event) {
    const question = this.questions[this.questionIndex];

    for (let option = 1; option <= question.choices.length; option++) {
      if (event.keyCode == 48 + option) {
        this.selectedOption = option;
        this.saveAnswer(option).then(() => {
          return this.loadAnsweredCount();
        });
      }
    }
  }

  handleKeyDown(event) {
    if (event.keyCode == Keys.LEFT) {
      this.onLeft();
    } else if (event.keyCode == Keys.RIGHT || event.keyCode == Keys.ENTER) {
      this.onRight();
    } else if (event.keyCode == Keys.UP) {
      this.onUp();
    } else if (event.keyCode == Keys.DOWN) {
      this.onDown();
    }

    const question = this.questions[this.questionIndex];
    if (question.type === "pick-one") {
      this.handlePickOneKeypress(event);
    }
  }

  incrementQuestionIndex() {
    this.questionIndex++;
    if (this.questionIndex >= this.questions.length) {
      this.questionIndex = 0;
    }
  }

  decrementQuestionIndex() {
    this.questionIndex--;
    if (this.questionIndex < 0) {
      this.questionIndex = this.questions.length - 1;
    }
  }

  renderPhotoProgress() {
    const percentage = Math.round(this.questionsAnswered / this.photoCount) *
      100;
    const answeredPercentage = `${percentage}` === "100"
      ? "100% 🎉"
      : percentage;

    return html`
    <p>
      photo <span id="photo-index">${
      this.photoIndex + 1
    }</span> of <span id="photo-count">${this.photoCount}</span> |
      <span id="photo-answered-count">${this.questionsAnswered}</span> answered (<span id="photo-answered-percentage">${answeredPercentage}</span>)
    </p>
    `;
  }

  renderFileInfo() {
    return html`<p id="photo-path">${this.imagePath}</p>`;
  }

  renderQuestion() {
    const question = this.questions[this.questionIndex];

    if (!question) {
      return html``;
    }
    return html`
    <div>
    <h2>[${question.question_id}] ${question.question}</h2>

    </div>
    `;
  }

  renderInput() {
    const question = this.questions[this.questionIndex];

    if (!question) {
      return html``;
    }

    const choices = question.choices ?? [];

    return html`
      <ul class="answers-list">
        ${
      choices.map((choice, idx) => {
        const classes = this.selectedOption === idx + 1 ? "selected" : "";

        return html`<li class="${classes}">[${idx + 1}] ${choice}</li>`;
      })
    }
      </ul>
    `;
  }

  render() {
    const backgroundModulus = this.questionIndex % BACKGROUNDS.length;
    const backgroundColour = BACKGROUNDS[backgroundModulus];

    document.querySelector("html").style.backgroundColor = backgroundColour;

    return html`
   <body>
    <h1>Linneaus</h1>

    ${this.renderNavigationInstructions()}
    ${this.renderContent()}
    ${this.renderPhotoProgress()}

    ${this.renderFileInfo()}

    ${this.renderQuestion()}
    ${this.renderInput()}
   </body>
    `;
  }
}

customElements.define("linneaus-app", LinneausApp);
