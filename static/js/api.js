const ENDPOINT = `http://localhost:5000`;

export class API {
  static photoUrl(index) {
    return `${ENDPOINT}/content/${index}#time=${Date.now()}&mode=photo`;
  }
  async getQuestions() {
    const res = await fetch(`${ENDPOINT}/questions`);
    return res.json();
  }

  async contentCount(question) {
    const res = await fetch(`${ENDPOINT}/questions/${question}/count`);
    const { count }  = await res.json();


    return count;
  }
  async getAnswerCount(question) {
    const res = await fetch(`${ENDPOINT}/answers/${question}/count`);
    return res.json();
  }
  async getAnswer(idx, question) {
    try {
      const res = await fetch(`${ENDPOINT}/answers/${question}/content/${idx}`);
      return res.json();
    } catch (err) {
      return;
    }
  }
  async saveAnswer(idx, question, option, choice) {
    await fetch(`${ENDPOINT}/answers/${question}/content/${idx}`, {
      method: "POST",
      body: JSON.stringify({
        question,
        option,
        choice,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
