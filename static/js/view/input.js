import { LitElem } from "/js/library/litelem.js";
import { html } from "/js/library/lit.js";
import { Keys } from "/js/constants.js";
import { API } from "/js/api.js";

class LinnaeusPickOneInput extends LitElem {
  static get properties() {
    return {
      question: {
        type: Object,
        state: true,
      },
      selectedOption: {
        type: Number,
        state: true,
      },
    };
  }

  render() {
    if (!this.question) {
      return html`<p>Loading...</p>`;
    }

    const choices = this.question.choices ?? [];
    return html`
      <ul class="answers-list">
        ${
      choices.map((choice, idx) => {
        const classes = this.selectedOption === idx + 1 ? "selected" : "";

        return html`<li class="${classes}">[${idx + 1}] ${choice}</li>`;
      })
    }
      </ul>
    `;
  }
}

customElements.define("linneaus-pick-one-input", LinnaeusPickOneInput);

// TODO NOT IMPLEMENTED
class LinnaeusPickManyInput extends LitElem {
  static get properties() {
    return {
      question: {
        type: Object,
        state: true,
      },
      selectedOptions: {
        type: Object,
        state: true,
      },
    };
  }

  render() {
    if (!this.question) {
      return html`<p>Loading...</p>`;
    }

    if (typeof this.selectedOptions === "undefined") {
      this.selectedOptions = {};
    }

    const choices = question.choices ?? [];

    return html`
      <ul class="answers-list">
        ${
      choices.map((choice, idx) => {
        const classes = this.selectedOption === idx + 1 ? "selected" : "";

        return html`<li class="${classes}">[${idx + 1}] ${choice}</li>`;
      })
    }
      </ul>
    `;
  }
}

customElements.define("linneaus-pick-many-input", LinnaeusPickManyInput);

class LinnaeusTextInput extends LitElem {
  static get properties() {
    return {
      question: {
        type: Object,
        state: true,
      },
    };
  }

  static BLOCKED = new Set([
    Keys.RIGHT,
    Keys.LEFT,
    Keys.UP,
    Keys.DOWN,
  ]);

  connectedCallback() {
    super.connectedCallback();

    addEventListener("keydown", this.handleKeyDown.bind(this));
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    removeEventListener("keydown", this.handleKeyDown);
  }

  handleKeyDown(event) {
    // submit an answer
    const value = document.querySelector("#free-text-input");

    // NOTE: no concurrency control here.
    // saves can happen out-of-order, potentially
    this.broadcast("save-answer", {
      contentIndex: this.contentIndex,
      questionId: this.question.id,
      text: value,
    });
  }

  render() {
    const placeholder = "Type here. Saves on keystroke";

    return html`
    <input
      id="free-text-input"
      type="text"
      title="Press Enter to move to next content"
      placeholder="${placeholder}"></input>
    `;
  }
}

export class LinnaeusTagsInput extends LitElem {
  constructor() {
    super();
    this.api = new API();
    this.tags = [];
    this.suggestions = [];
  }

  static get properties() {
    return {
      contentIndex: {
        type: Number,
        state: true,
      },
      question: {
        type: Object,
        state: true,
      },
      tags: {
        type: Array,
        state: true,
      },
      lastLoadedContentIndex: {
        type: Number,
        state: true,
      },
      suggestions: {
        type: Array,
        state: true,
      }
    };
  }

  async deleteTag(event) {
    this.tags = this.tags ?? [];
    const removedTag = event.target.parentElement.querySelector('.tagname')?.innerText;
    this.tags = this.tags.filter(tag => tag !== removedTag);

    await this.saveAnswer(this.tags);
  }

  renderSuggestion(suggestion) {
    return html`<option value="${suggestion}"></option>`;
  }

  renderTag(tagname) {
    return html`<li class="tag">
      <span class="tagname">${tagname}</span>
      <button class="delete-tag" @click=${this.deleteTag.bind(this)}>x</button>
    </li>`;
  }

  async loadAnswer() {
    if (!this.question) {
      return;
    }

    const answer = await this.api.getAnswer(
      this.contentIndex,
      this.question.id,
    );

    if (!answer?.answer) {
      this.tags = [];
    }

    this.tags = answer.answer;
    this.lastLoadedContentIndex = this.contentIndex;
  }

  async loadSuggestions() {
    if (!this.question) {
      return;
    }

    const suggestions = await this.api.getSuggestions(
      this.question.id,
    );

    this.suggestions = suggestions;
  }

  saveAnswer(answer) {
    return this.api.saveAnswer(
      this.contentIndex,
      this.question.id,
      "",
      answer.join(','),
    );
  }

  async handleKeyDown(event) {
    const input = this.querySelector("#tag-input");
    const tag = input.value;
    this.tags = this.tags ?? [];

    if (event.key === "Enter") {
      if (!tag) {
        return
      }

      const newTags = tag.split(/\s*?,\s*?/g);

      for (const newTag of newTags) {
        if (!this.tags.includes(newTag)) {
          this.tags = [...this.tags, newTag];
        }
      }

      try {
        await this.saveAnswer(this.tags);
        input.value = '';
      } catch (err) {
        console.error(err);
      }

      event.stopPropagation();
      event.preventDefault();
    }

    if ([Keys.LEFT, Keys.RIGHT, Keys.UP, Keys.DOWN].includes(event.keyCode)) {
      event.stopPropagation();
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("keydown", this.handleKeyDown.bind(this));

    this.loadAnswer();
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this.removeEventListener("keydown", this.handleKeyDown);
  }

  render() {
    this.tags = this.tags ?? [];

    if (this.lastLoadedContentIndex !== this.contentIndex) {
      this.loadAnswer();
      this.loadSuggestions();
    }

    const placeholder = "Type here. Saves on Enter";

    return html`
    <section>
      <datalist id="tags-option-list">
        ${(this.suggestions ?? []).map(suggestion => this.renderSuggestion(suggestion))}
      </datalist>
      <ul id="tag-list">
        ${this.tags.map(tag => this.renderTag(tag))}
      </ul>
      <input
        id="tag-input"
        list="tags-option-list"
        type="text"
        placeholder="${placeholder}"></input>
    </section>
    `
  }
}
customElements.define("linneaus-tags-input", LinnaeusTagsInput);
customElements.define("linneaus-text-input", LinnaeusTextInput);
