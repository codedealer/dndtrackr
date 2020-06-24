class Record {
  constructor (diceResult) {
    this.rolls = diceResult.rolls;
    this.params = diceResult.diceParams.clone();
  }
}

export default Record;