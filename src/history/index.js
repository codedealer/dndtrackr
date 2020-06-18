import config from '../config';

class History {
  constructor(max) {
    this.max = max;
    this.q = [];
    this.i = 0;
    this.current = false;
  }
  push(item) {
    if (this.q.length === this.max) this.q.shift();
    this.q.push(item);
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
