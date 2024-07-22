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

  setUrl(contentId, questionId) {
    const url = new URL(window.location);
    const params = new URLSearchParams(url.search);

    params.set('contentId', contentId);
    params.set('questionId', questionId);

    url.search = params.toString();
    window.history.replaceState({}, '', url);
  }

  toURL() {
    this.setUrl(this._contentId + 1, this._questionId);
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
