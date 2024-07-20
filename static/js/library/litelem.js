import { LitElement } from "/js/library/lit.js";

export class LitElem extends LitElement {
  createRenderRoot() {
    return this;
  }

  broadcast(label, detail) {
    return () => {
      const dispatched = new CustomEvent(label, {
        detail,
        bubbles: true,
        composed: true,
      });

      this.dispatchEvent(dispatched);
    };
  }
}
