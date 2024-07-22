import { LitElem } from "/js/library/litelem.js";
import { html } from "/js/library/lit.js";
import { API } from "/js/api.js";
import { Keys } from "/js/constants.js";
import { Router } from "/js/router.js";

import "/js/view/content.js";
import "/js/view/input.js";
import "/js/view/navigation-guide.js";
import "/js/view/navigation-links.js";
import "/js/view/progress.js";
import "/js/view/question.js";

const BACKGROUNDS = [
  "#7ED7C1",
  "#957ED7",
  "#D77E94",
  "#C1D77E",
];

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
    this.router = new Router();
    this.router.questionId = this.questionIndex;
    this.router.contentId = this.photoIndex;
  }

  connectedCallback() {
    super.connectedCallback();
    addEventListener("keydown", this.handleKeyDown.bind(this));

    this.loadQuestions()
      .then(() => this.loadContentCount())
      .then(() => this.loadAnsweredCount());
  }

  async loadQuestions() {
    this.questions = await this.api.getQuestions();
  }

  async loadContentCount() {
    if (!this.questions) {
      return;
    }

    const question = this.questions[this.questionIndex];
    this.photoCount = await this.api.contentCount(question.id);
  }

  async loadAnsweredCount() {
    if (!this.questions) {
      return html``;
    }
    const question = this.questions[this.questionIndex];
    const { count } = await this.api.getAnswerCount(question.id);
    this.questionsAnswered = count;
  }

  async loadAnswer() {
    const question = this.questions[this.questionIndex];
    const answer = await this.api.getAnswer(
      this.photoIndex,
      question.id,
    );

    if (answer) {
      this.selectedOption = parseInt(answer.answer, 10);
    }
  }

  async saveAnswer(option) {
    if (!this.questions) {
      return;
    }
    const question = this.questions[this.questionIndex];

    return this.api.saveAnswer(
      this.photoIndex,
      question.id,
      option,
      question.choices[option - 1],
    );
  }

  onUp() {
    this.questionIndex--;

    if (this.questionIndex < 0) {
      this.questionIndex = this.questions.length - 1;
    }
    this.router.questionId = this.questionIndex; // todo use question id

    this.loadContentCount().then(() => {
      if (this.photoIndex > this.photoCount - 1) {
        this.photoIndex = Math.max(0, this.photoCount - 1);
      }
    });
    this.loadAnsweredCount();
    this.loadAnswer();

    if (this.photoIndex > this.photoCount - 1) {
      this.photoIndex = Math.max(0, this.photoCount - 1);
    }
  }

  onDown() {
    this.questionIndex++;

    if (this.questionIndex >= this.questions.length) {
      this.questionIndex = 0;
    }
    this.router.questionId = this.questionIndex; // todo use question id

    this.loadContentCount().then(() => {
      if (this.photoIndex > this.photoCount - 1) {
        this.photoIndex = Math.max(0, this.photoCount - 1);
      }
    });

    this.loadAnsweredCount();
    this.loadAnswer();
  }

  onLeft() {
    this.photoIndex--;

    if (this.photoIndex < 0) {
      this.photoIndex = Math.max(0, this.photoCount - 1);
    }
    this.router.contentId = this.photoIndex; // todo use question id

    this.loadAnswer();
  }

  onRight() {
    this.photoIndex++;

    if (this.photoIndex > this.photoCount - 1) {
      this.photoIndex = 0;
    }
    this.router.contentId = this.photoIndex; // todo use question id

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

  renderFileInfo() {
    return html`<p id="photo-path">${this.imagePath}</p>`;
  }

  render() {
    const backgroundModulus = this.questionIndex % BACKGROUNDS.length;
    const backgroundColour = BACKGROUNDS[backgroundModulus];

    document.querySelector("html").style.backgroundColor = backgroundColour;

    return html`
   <body>
    <h1>Linneaus</h1>

    <linneaus-navigation-guide></linneaus-navigation-guide>
    <linneaus-navigation-links></linneaus-navigation-links>
    <linneaus-content
      .questions=${this.questions}
      .questionIndex=${this.questionIndex}
      .photoIndex=${this.photoIndex}></linneaus-content>

    <linneaus-photo-progress
      .photoIndex=${this.photoIndex}
      .photoCount=${this.photoCount}
      .questionsAnswered=${this.questionsAnswered}
      ></linneaus-photo-progress>

    ${this.renderFileInfo()}

    <linneaus-question
      .questions=${this.questions}
      .questionIndex=${this.questionIndex}>
    </linneaus-question>

    <linneaus-pick-one-input
      .questions=${this.questions}
      .questionIndex=${this.questionIndex}
      .selectedOption=${this.selectedOption}>
    </linneaus-pick-one-input>

   </body>
    `;
  }
}

customElements.define("linneaus-app", LinneausApp);
