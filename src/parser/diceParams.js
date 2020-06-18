class DiceParams {
  constructor() {
    this.dice = {};
    this.parsedStr = [];
    this.advantage = false;
    this.disadvantage = false;
  }
  isModifiedRoll() {
    return this.advantage || this.disadvantage;
  }
}

export default DiceParams;
