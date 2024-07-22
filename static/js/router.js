export class Router {
  fromURL() {
  }
  toURL() {
    window.location.hash = `#?contentId=${
      this._contentId + 1
    }&questionId=${this._questionId}`;
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
