const ENDPOINT = `http://localhost:5000`;

export class API {
  static photoUrl(questionIndex, index) {
    return `${ENDPOINT}/questions/${questionIndex}/content/${index}?mode=photo#time=${Date.now()}`;
  }

  async marco() {
    const res = await fetch(`${ENDPOINT}/healthCheck`, {
      timeout: 1_000,
    });
    return res.json();
  }

  async getUnanswered(question, contentId) {
    const qs = typeof contentId !== 'undefined'
      ? `?startIndex=${contentId}`
      : '';

    const res = await fetch(`${ENDPOINT}/answers/${question}/unanswered${qs}`);
    return res.json();
  }

  async getQuestions() {
    const res = await fetch(`${ENDPOINT}/questions`);
    return res.json();
  }

  async contentCount(question) {
    const res = await fetch(`${ENDPOINT}/questions/${question}/count`);
    const { count } = await res.json();

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
  async getSuggestions(question) {
    const res = await fetch(`${ENDPOINT}/questions/${question}/suggestions`);
    return res.json();
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
