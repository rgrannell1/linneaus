import { LitElem } from "/js/library/litelem.js";
import { html } from "/js/library/lit.js";
import { API } from "/js/api.js";
import { Keys } from "/js/constants.js";
import { Router } from "/js/router.js";

import "/js/view/content.js";
import "/js/view/input.js";
import "/js/view/navigation-guide.js";
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
      questions: {
        type: Array,
        state: true,
      },
      question: {
        type: Object,
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
      contentIndex: {
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
      offline: {
        type: Boolean,
        state: true,
      },
      nextUnansweredId: {
        type: Number,
        state: true,
      },

      // tags
      tags: {
        type: Array,
        state: true,
      },
    };
  }

  constructor() {
    super();

    const { contentId, questionId } = Router.fromURL();

    this.questions = [];
    this.questionIndex = questionId;

    this.photoCount = 0;
    this.contentIndex = contentId;
    this.questionsAnswered = 0;

    this.api = new API();
    this.offline = false;

    // update the URL based on selected questionId and contentId
    this.router = new Router();
    this.router.questionId = this.questionIndex;
    this.router.contentId = this.contentIndex;
  }

  connectedCallback() {
    super.connectedCallback();
    addEventListener("keydown", this.handleKeyDown.bind(this));

    this.healthcheckPid = setInterval(async () => {
      try {
        await this.api.marco();
        if (this.offline) {
          this.offline = false;
        }
      } catch (err) {
        if (!this.offline) {
          this.offline = true;
        }
      }
    }, 2_500);

    Promise.all([
      this.loadQuestions(),
      this.loadContentCount(),
      this.loadAnsweredCount(),
      this.loadAnswer(),
      this.loadUnanswered()
    ]);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    clearInterval(this.healthcheckPid);

    removeEventListener("keydown", this.handleKeyDown);
  }

  async loadQuestions() {
    this.questions = await this.api.getQuestions();
    this.question = this.questions[this.questionIndex];

    Promise.all([
      this.loadContentCount(),
      this.loadAnsweredCount(),
      this.loadAnswer(),
      this.loadUnanswered()
    ]).then(() => {
    });
  }

  async loadContentCount() {
    if (!this.question) {
      return;
    }

    this.photoCount = await this.api.contentCount(this.question.id);
  }

  async loadAnsweredCount() {
    if (!this.question) {
      return;
    }
    const { count } = await this.api.getAnswerCount(this.question.id);
    this.questionsAnswered = count;
  }

  async loadAnswer() {
    if (!this.question) {
      return;
    }

    const answer = await this.api.getAnswer(
      this.contentIndex,
      this.question.id,
    );

    if (!answer) {
      return;
    }

    if (this.question.type === "pick-one") {
      this.selectedOption = parseInt(answer.answer, 10);
    } else if (this.question.type === "free-text" && answer.answer) {
      document.querySelector("#free-text-input").value = answer.answer;
    } else if (this.question.type === "tags") {
      console.log('removing code path');
    }
  }

  async loadUnanswered() {
    if (!this.question) {
      return;
    }
    const res = await this.api.getUnanswered(this.question.id, this.contentId);

    if (typeof res.index !== 'undefined') {
      this.nextUnansweredId = res.index ?? 1;
    }
  }

  async saveEventAnswer(event) {
    console.log("receiving");
    console.log(event);
  }

  async saveAnswer(option) {
    if (!this.question) {
      return;
    }

    if (this.question.type === "pick-one") {
      return this.api.saveAnswer(
        this.contentIndex,
        this.question.id,
        option,
        this.question.choices[option - 1],
      );
    } else if (this.question.type === "free-text") {
      return this.api.saveAnswer(
        this.contentIndex,
        this.question.id,
        "",
        option,
      );
    } else if (this.question.type === "tags") {
      console.error('unimplemented')
    } else {
      throw new Error(`question-type "${this.question.type}" is not supported`);
    }
  }

  onUp() {
    this.questionIndex--;

    if (this.questionIndex < 0) {
      this.questionIndex = this.questions.length - 1;
    }

    this.question = this.questions[this.questionIndex];
    this.router.questionId = this.questionIndex; // todo use question id

    this.loadContentCount().then(() => {
      if (this.contentIndex > this.photoCount - 1) {
        this.contentIndex = Math.max(0, this.photoCount - 1);
      }
    });
    this.loadAnsweredCount();
    this.loadAnswer();
    this.loadUnanswered();

    if (this.contentIndex > this.photoCount - 1) {
      this.contentIndex = Math.max(0, this.photoCount - 1);
    }
  }

  onDown() {
    this.questionIndex++;

    if (this.questionIndex >= this.questions.length) {
      this.questionIndex = 0;
    }
    this.question = this.questions[this.questionIndex];
    // todo use question id
    this.router.questionId = this.questionIndex;

    this.loadContentCount().then(() => {
      if (this.contentIndex > this.photoCount - 1) {
        this.contentIndex = Math.max(0, this.photoCount - 1);
      }
    });

    Promise.all([
      this.loadAnsweredCount(),
      this.loadAnswer(),
      this.loadUnanswered()
    ]);
  }

  onLeft() {
    this.contentIndex--;

    if (this.contentIndex < 0) {
      this.contentIndex = Math.max(0, this.photoCount - 1);
    }
    this.router.contentId = this.contentIndex; // todo use question id

    this.loadAnswer();
    this.loadUnanswered();
  }

  onRight() {
    this.contentIndex++;

    if (this.contentIndex > this.photoCount - 1) {
      this.contentIndex = 0;
    }
    this.router.contentId = this.contentIndex; // todo use question id

    this.loadAnswer();
    this.loadUnanswered();
  }

  handlePickOneKeypress(event) {
    for (let option = 1; option <= this.question.choices.length; option++) {
      if (event.keyCode == 48 + option) {
        this.selectedOption = option;
        this.saveAnswer(option).then(() => {
          return this.loadAnsweredCount();
        });
      }
    }
  }

  handleFreeTextKeypress(event) {
    if (event.target.id !== "free-text-input") {
      return;
    }

    const value = event.target.value;
    this.saveAnswer(value);
  }

  // THIS IS SO BAD. MOVE TO INPUTS
  handleKeyDown(event) {

    // clear free text input on left/right
    if (this.question.type === "free-text"  && event.target.id !== 'free-text-input') {
      if (event.keyCode == Keys.LEFT || event.keyCode == Keys.RIGHT) {
        document.querySelector("#free-text-input").value = '';
      }
    }

    if (this.question && event.target.id !== 'free-text-input')  {
      if (event.keyCode == Keys.LEFT) {
        this.onLeft();
      } else if (event.keyCode == Keys.RIGHT) {
        this.onRight();
      }
    }

    // allow enter to skip to next question, when entered on blank input field
    if (event.keyCode == Keys.ENTER) {
      if (this.question.type !== "tags") {
        this.onRight();
      } else if (event.target.value === '') {
        this.onRight();
      }
    }

    if (event.keyCode == Keys.UP) {
      this.onUp();
    } else if (event.keyCode == Keys.DOWN) {
      this.onDown();
    }

    // TODO bind this in the component itself
    if (this.question.type === "pick-one") {
      this.handlePickOneKeypress(event);
    } else if (this.question.type === "free-text") {
      this.handleFreeTextKeypress(event);
    }
  }

  incrementQuestionIndex() {
    this.questionIndex++;
    if (this.questionIndex >= this.questions.length) {
      this.questionIndex = 0;
    }
    this.question = this.questions[this.questionIndex];
  }

  decrementQuestionIndex() {
    this.questionIndex--;
    if (this.questionIndex < 0) {
      this.questionIndex = this.questions.length - 1;
    }
    this.question = this.questions[this.questionIndex];
  }

  /*
   * Renders the correct content
   */
  renderContent() {
    return html`
    <linneaus-photo
      .question=${this.question}
      .contentIndex=${this.contentIndex}></linneaus-photo>
    `;
  }

  /*
   * Render the correct input based on question type.
   *
   * Supported:
   * - pick-one
   * - free-text
   */
  renderInput() {
    if (!this.question) {
      return html`<p>Loading...</p>`;
    }

    const question = this.question;

    if (question.type === "pick-one") {
      return html`<linneaus-pick-one-input
        .question=${this.question}
        .selectedOption=${this.selectedOption}>
      </linneaus-pick-one-input>
      `;
    } else if (question.type === "free-text") {
      return html`<linneaus-text-input
        @save-answer=${this.saveEventAnswer}
        .question=${this.question}></linneaus-text-input>`;
    } else if (question.type === "tags") {
      return html`<linneaus-tags-input
        @save-answer=${this.saveEventAnswer}
        .contentIndex=${this.contentIndex}
        .question=${this.question}></linneaus-tags-input>`;
    } else {
      throw new Error(`unsupported type ${question.type}`);
    }
  }

  /*
   * Render navigation links
   *
   */
  renderLinks() {
    const moveToFirst = () => {
      this.contentIndex = 1;
      this.router.contentId = this.contentIndex;

      this.loadAnsweredCount(),
      this.loadAnswer(),
      this.loadUnanswered()
    }

    const moveToLast = () => {
      this.contentIndex = this.photoCount - 1;
      this.router.contentId = this.contentIndex;

      this.loadAnsweredCount(),
      this.loadAnswer(),
      this.loadUnanswered()
    }

    const moveToUnanswered = () => {
      if (this.nextUnansweredId === -1) {
        return;
      }

      this.contentIndex = this.nextUnansweredId;
      this.router.contentId = this.contentIndex;

      this.loadAnsweredCount(),
      this.loadAnswer(),
      this.loadUnanswered()
    }

    return html`
    <p>
      go to
      <a href="#"
        @click=${moveToFirst.bind(this)}>first</a> |
      <a href="#"
        @click=${moveToLast.bind(this)}>last</a> |
      <a href="#"
        @click=${moveToUnanswered.bind(this)}
        class="${ this.nextUnansweredId === -1 ? 'disabled' : '' }">unanswered</a>
    </p>
    `;
  }

  render() {
    const backgroundModulus = this.questionIndex % BACKGROUNDS.length;
    const backgroundColour = BACKGROUNDS[backgroundModulus];

    document.querySelector("html").style.backgroundColor = backgroundColour;

    // greyscale when offline
    document.querySelector("html").style.filter = this.offline
      ? "grayscale(100%)"
      : "none";

    document.querySelector("#offline-message").className = this.offline
      ? "active"
      : "none";

    return html`
   <body>
    <h1>Linneaus</h1>

    <linneaus-navigation-guide></linneaus-navigation-guide>

    ${this.renderLinks()}
    ${this.renderContent()}

    <linneaus-photo-progress
      .contentIndex=${this.contentIndex}
      .photoCount=${this.photoCount}
      .questionsAnswered=${this.questionsAnswered}
      ></linneaus-photo-progress>

    <linneaus-question .question=${this.question}></linneaus-question>

    ${this.renderInput()}
  </body>
    `;
  }
}

customElements.define("linneaus-app", LinneausApp);
