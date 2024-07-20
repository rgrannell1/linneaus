
import { LitElem } from "/js/library/litelem.js";
import { html } from "/js/library/lit.js";

export class LinnaeusQuestion extends LitElem {
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
    };
  }

  render() {
    if (!this.questions) {
      return html`<p>Loading...</p>`;
    }
    const question = this.questions[this.questionIndex];
    if (!question) {
      return html`<p>Loading...</p>`;
    }

    return html`
    <div>
      <h2>[${question.id}] ${question.text}</h2>
    </div>
    `;
  }
}

customElements.define("linneaus-question", LinnaeusQuestion);
