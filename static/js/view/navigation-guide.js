import { LitElem } from "/js/library/litelem.js";
import { html } from "/js/library/lit.js";

export class LinnaeusNavigationGuide extends LitElem {
  render() {
    // I don't like the term "content", but hey it's standard now.
    return html`
      <p class="navigation-guide">Navigate between content with ←, →</p>
      <p class="navigation-guide">Navigate between questions with ↑, ↓</p>
    `;
  }
}

customElements.define("linneaus-navigation-guide", LinnaeusNavigationGuide);
