export class Ansi {
  static bold(text: string) {
    return `\u001B[1m${text}\u001B[0m`;
  }
  static link(text: string, url: string) {
    return `\u001B]8;;${url}\u0007${text}\u001B]8;;\u0007`;
  }
  static green(text: string) {
    return `\u001B[32m${text}\u001B[0m`;
  }
}
