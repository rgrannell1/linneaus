import { LitElem } from "/js/library/litelem.js";
import { html } from "/js/library/lit.js";

export class LinnaeusPhotoProgress extends LitElem {
  static get properties() {
    return {
      photoIndex: {
        type: Number,
        state: true,
      },
      photoCount: {
        type: Number,
        state: true,
      },
      questionsAnswered: {
        type: Number,
        state: true,
      },
    };
  }

  render() {
    if (this.photoCount === 0) {
      return html`<p>no eligable content for this question</p>`;
    }

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
}

customElements.define("linneaus-photo-progress", LinnaeusPhotoProgress);
