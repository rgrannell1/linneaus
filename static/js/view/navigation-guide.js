
import { LitElem } from "/js/library/litelem.js";
import { html } from "/js/library/lit.js";

export class LinnaeusNavigationGuide extends LitElem {
  render() {
    return html`
      <p class="navigation-guide">Navigate between photos with ←, →</p>
      <p class="navigation-guide">Navigate between questions with ↑, ↓</p>
    `;
  }
}

customElements.define("linneaus-navigation-guide", LinnaeusNavigationGuide);