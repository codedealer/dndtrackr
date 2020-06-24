import config from '../config';
import Record from './record';
import DiceResult from '../parser/diceResult';
import DiceParams from '../parser/diceParams';

class History {
  constructor(max) {
    this.max = max;
    this.q = [];
    this.i = 0;
    this.current = false;
  }
  get current () {
    return this._current;
  }
  set current (record) {
    // can't check class because observer wrapper is returned by localforage
    if ({}.hasOwnProperty.call(record, 'rolls')) {
      // convert record back to diceResult
      this._current = new DiceResult(new DiceParams(record.params), record.rolls);
    } else {
      this._current = record;
    }
  }
  push(diceResult) {
    if (this.q.length === this.max) this.q.shift();

    this.q.push(new Record(diceResult));
    this.i = this.q.length;
  }
  prev() {
    if (this.q.length === 0) {
      this.current = false;
      return;
    }
    if (this.i === 0) {
      this.current = false;
      return;
    }

    this.current = this.q[--this.i];
  }
  next() {
    if (this.q.length === 0) {
      this.current = false;
      return;
    }
    // skip the first one
    if (this.i >= this.q.length - 1) {
      if (this.i < this.q.length) this.i++;

      this.current = false;
      return;
    }

    this.current = this.q[++this.i];
  }
}

export default new History(config.rollHistoryStackSize || 100);
