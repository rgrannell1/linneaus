export class Router {
  static fromURL() {
    const params = new URLSearchParams(window.location.search);
    const contentId = parseInt(params.get("contentId")) - 1;
    const questionId = parseInt(params.get("questionId"));

    return {
      contentId: Number.isNaN(contentId) ? 0 : contentId,
      questionId: Number.isNaN(questionId) ? 0 : questionId,
    };
  }
  toURL() {
    const url = new URL(window.location);
    const params = new URLSearchParams(url.search);

    params.set('contentId', this._contentId + 1);
    params.set('questionId', this._questionId);

    url.search = params.toString();
    window.history.replaceState({}, '', url);
  }

  set contentId(value) {
    this._contentId = value;
    this.toURL();
  }

  set questionId(value) {
    this._questionId = value;
    this.toURL();
  }
}
