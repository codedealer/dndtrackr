class DiceResult {
  constructor(diceParams, diceRolls = [{}, {}]) {
    // up to two separate rolls stored with keys indicating
    // position in a parsed string in diceParams
    this.rolls = diceRolls;

    this.diceParams = diceParams;
  }
  get empty() {
    return !this.diceParams.parsedStr.length;
  }
  representInput(includeModifier = false) {
    let output = this.diceParams.parsedStr.join(' ');
    if (!includeModifier || !this.diceParams.isModifiedRoll()) return output;

    if (this.diceParams.advantage) {
      return output + 'a';
    }

    return output + 'd';
  }
  eval(roll) {
    const e = Object.assign([], this.diceParams.parsedStr, roll)
      .map(s => (s.join ? s.join('+') : s))
      .join('');
    // eslint-disable-next-line no-eval
    return eval(e);
  }
}

export default DiceResult;
