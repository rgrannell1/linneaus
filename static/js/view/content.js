import { LitElem } from "/js/library/litelem.js";
import { html } from "/js/library/lit.js";
import { API } from "/js/api.js";

export class LinnaeusContent extends LitElem {
  static get properties() {
    return {
      photoIndex: {
        type: Number,
        state: true,
      },
      questions: {
        type: Array,
        state: true
      },
      questionIndex: {
        type: String,
        state: true
      }
    };
  }

  render() {
    const question = this.questions[this.questionIndex];
    const index = typeof this.photoIndex === "undefined" ? 0 : this.photoIndex;

    return html`
    <image width="600" id="preview-image" src="${API.photoUrl(question.id, index)}"></image>
    `;
  }
}

customElements.define("linneaus-content", LinnaeusContent);
