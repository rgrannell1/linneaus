import { LitElem } from "/js/library/litelem.js";
import { html } from "/js/library/lit.js";
import { API } from "/js/api.js";

export class LinnaeusNavigationLinks extends LitElem {
  static get properties() {
    return {
      contentId: {
        type: Number,
        state: true,
      },
      nextUnansweredId: {
        type: Number,
        state: true,
      },
      question: {
        type: Object,
        state: true,
      },
      photoCount: {
        type: Number,
        state: true,
      },
    };
  }

  constructor() {
    super();
    this.api = new API();
  }

  async loadUnanswered() {
    if (!this.question) {
      return;
    }
    const res = await this.api.getUnanswered(this.question.id, this.contentId);

    if (res.index) {
      this.nextUnansweredId = res.index;
    }
  }

  connectedCallback() {
    super.connectedCallback();

    this.loadUnanswered();
  }

  render() {
    this.loadUnanswered();

    const firstHref = `?contentId=1&questionId=${this.questionId}`;
    const lastHref =
      `?contentId=${this.photoCount}&questionId=${this.questionId}`;

    const nextUnanswered = `?contentId=${this.nextUnansweredId}&questionId=${this.question?.id}`;

    return html`
    <p>
      go to
      <a href="${firstHref}">first</a> |
      <a href="${lastHref}">last</a> |
      <a href="${nextUnanswered}">unanswered</a>
    </p>
    `;
  }
}

customElements.define("linneaus-navigation-links", LinnaeusNavigationLinks);
