import { LitElem } from "/js/library/litelem.js";
import { html } from "/js/library/lit.js";

class LinnaeusInput extends LitElem {
  static get properties() {
    return {
      questions: {
        type: Array,
        state: true,
      },
      questionIndex: {
        type: Number,
        state: true,
      },
      selectedOption: {
        type: Number,
        state: true,
      },
    };
  }

  render() {
    if (!this.questions || this.questions.length === 0) {
      return html`<p>Loading...</p>`;
    }

    const index = typeof this.questionIndex === "undefined"
      ? 0
      : this.questionIndex;

    const question = this.questions[index];
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

customElements.define("linneaus-input", LinnaeusInput);
