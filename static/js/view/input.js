import { LitElem } from "/js/library/litelem.js";
import { html } from "/js/library/lit.js";
import { Keys } from "/js/constants.js";

class LinnaeusPickOneInput extends LitElem {
  static get properties() {
    return {
      question: {
        type: Object,
        state: true,
      },
      selectedOption: {
        type: Number,
        state: true,
      },
    };
  }

  render() {
    if (!this.question) {
      return html`<p>Loading...</p>`;
    }

    const choices = this.question.choices ?? [];
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
}

customElements.define("linneaus-pick-one-input", LinnaeusPickOneInput);

class LinnaeusPickManyInput extends LitElem {
  static get properties() {
    return {
      question: {
        type: Object,
        state: true,
      },
      selectedOptions: {
        type: Object,
        state: true,
      },
    };
  }

  render() {
    if (!this.question) {
      return html`<p>Loading...</p>`;
    }

    if (typeof this.selectedOptions === "undefined") {
      this.selectedOptions = {};
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
}

customElements.define("linneaus-pick-many-input", LinnaeusPickManyInput);

class LinnaeusTextInput extends LitElem {
  static get properties() {
    return {
      question: {
        type: Object,
        state: true
      },
    };
  }

  static BLOCKED = new Set([
    Keys.RIGHT,
    Keys.LEFT,
    Keys.UP,
    Keys.DOWN
  ])

  connectedCallback() {
    super.connectedCallback();

    addEventListener("keydown", this.handleKeyDown.bind(this));
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    removeEventListener("keydown", this.handleKeyDown);
  }

  handleKeyDown(event) {
    // submit an answer
    const value = document.querySelector('#free-text-input');

    // NOTE: no concurrency control here.
    // saves can happen out-of-order, potentially
    this.broadcast('save-answer', {
      contentIndex: this.contentIndex,
      questionId: this.question.id,
      text: value,
    });
  }

  render() {
    return html`<input id="free-text-input" type="text" placeholder="Type here. Answer saves on keystroke"></input>`
  }
}

customElements.define("linneaus-text-input", LinnaeusTextInput);
