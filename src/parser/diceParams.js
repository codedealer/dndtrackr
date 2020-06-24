class DiceParams {
  constructor({ dice = {}, parsedStr = [], advantage = false, disadvantage = false } = {}) {
    this.dice = dice;
    this.parsedStr = parsedStr;
    this.advantage = advantage;
    this.disadvantage = disadvantage;
  }
  isModifiedRoll() {
    return this.advantage || this.disadvantage;
  }
  clone () {
    const clone = {
      dice: { ...this.dice },
      parsedStr: [ ...this.parsedStr ],
      advantage: this.advantage,
      disadvantage: this.disadvantage
    }

    return clone;
  }
}

export default DiceParams;
