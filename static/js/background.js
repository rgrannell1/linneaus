export class Background {
  constructor() {
    this.colourIndex = 0;
  }
  COLOURS = [
    "#7ED7C1",
    "#957ED7",
    "#D77E94",
    "#C1D77E",
  ];

  nextBackground() {
    this.colourIndex++;
    if (this.colourIndex >= this.COLOURS.length) {
      this.colourIndex = 0;
    }

    return this.COLOURS[this.colourIndex];
  }

  previousBackground() {
    this.colourIndex--;
    if (this.colourIndex < 0) {
      this.colourIndex = this.COLOURS.length - 1;
    }

    return this.COLOURS[this.colourIndex];
  }

  setNextBackground() {
    const colour = this.nextBackground();
    $("html").css("background-color", colour);
  }

  setPreviousBackground() {
    const colour = this.previousBackground();
    $("html").css("background-color", colour);
  }
}
