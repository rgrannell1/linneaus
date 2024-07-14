
const ENDPOINT = `http://localhost:5000`;

export class API {
  static photoUrl(id) {
    return `${ENDPOINT}/photos/${id}#time=${Date.now()}`
  }
  async getQuestions() {
    const res = await fetch(`${ENDPOINT}/questions`);
    return res.json();
  }
  async info(idx) {
    const res = await fetch(`${ENDPOINT}/photos/${idx}/info`);
    return res.text();
  }
  async photoCount(question) {
    const res = await fetch(`${ENDPOINT}/photos/${question}/count`);
    return res.text();
  }
  async getAnswerCount(question) {
    const res = await fetch(`${ENDPOINT}/photos/${question}/answer_count`);
    return res.json();
  }
  async getAnswer(idx, question) {
    const res = await fetch(`${ENDPOINT}/photos/${idx}/${question}/answer`);
    return res.json();
  }
  async saveAnswer(idx, question, option, choice) {
    await fetch(`${ENDPOINT}/photos/${idx}/${question}/answer`, {
      method: 'POST',
      body: JSON.stringify({
        question,
        option,
        choice
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
