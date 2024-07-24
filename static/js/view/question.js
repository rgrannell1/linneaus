import { LitElem } from "/js/library/litelem.js";
import { html } from "/js/library/lit.js";

export class LinnaeusQuestion extends LitElem {
  static get properties() {
    return {
      question: {
        type: Object,
        state: true,
      }
    };
  }

  render() {
    if (!this.question) {
      return html`<p>Loading...</p>`;
    }

    return html`
    <div>
      <h2 class="question">[${this.question.id}] ${this.question.text}</h2>
    </div>
    `;
  }
}

customElements.define("linneaus-question", LinnaeusQuestion);
