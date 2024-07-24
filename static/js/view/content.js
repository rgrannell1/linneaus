import { LitElem } from "/js/library/litelem.js";
import { html } from "/js/library/lit.js";
import { API } from "/js/api.js";

export class LinnaeusPhoto extends LitElem {
  static get properties() {
    return {
      contentIndex: {
        type: Number,
        state: true,
      },
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
    <image width="600" id="preview-image" src="${
      API.photoUrl(this.question.id, this.contentIndex)
    }"></image>
    `;
  }
}

customElements.define("linneaus-photo", LinnaeusPhoto);

export class LinnaeusText extends LitElem {
  static get properties() {
    return {
      question: {
        type: Object,
        state: true,
      }
    };
  }

  render() {
    if (!question) {
      return html`<p>Loading...</p>`;
    }

    return html`
    <p>Testing!</p>
    `;
  }
}

customElements.define("linneaus-text", LinnaeusText);
