import { LitElem } from "/js/library/litelem.js";
import { html } from "/js/library/lit.js";

export class LinnaeusNavigationLinks extends LitElem {
  static get properties() {
    return {
      contentId: {
        type: Number,
        state: true,
      },
      questionId: {
        type: Number,
        state: true,
      },
      photoCount: {
        type: Number,
        state: true,
      },
    };
  }
  render() {
    const firstHref = `?contentId=1&questionId=${this.questionId}`;
    const lastHref = `?contentId=${this.photoCount}&questionId=${this.questionId}`;

    return html`
    <p>
      go to
      <a href="${firstHref}">first</a> |
      <a href="${lastHref}">last</a> |
      <a href="#">unanswered</a>
    </p>
    `;
  }
}

customElements.define("linneaus-navigation-links", LinnaeusNavigationLinks);
