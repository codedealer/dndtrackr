const MAX = 100;
export default {
  q: [],
  i: -1,
  push (item) {
    if (this.q.length === MAX) this.q.shift();
    this.i = this.q.length;
    this.q.push(item);
  },
  prev () {
    if (this.q.length === 0) return false;
    if (this.i === -1) return false;

    this.i--;
    return this.q[this.i + 1];
  },
  next () {
    if (this.q.length === 0) return { str: '', result: [] };
    // skip the first one
    if (this.i === -1) this.i++;
    if (this.i === this.q.length - 1) return { str: '', result: [] };

    this.i++;
    return this.q[this.i];
  }
}
