import { LitElem } from "/js/library/litelem.js";
import { html } from "/js/library/lit.js";

export class LinnaeusNavigationLinks extends LitElem {
  render() {
    return html`
    <p>
      go to
      <a href="#">first</a> |
      <a href="#">last</a> |
      <a href="#">unanswered</a>
    </p>
    `;
  }
}

customElements.define("linneaus-navigation-links", LinnaeusNavigationLinks);
