class Cache {
  constructor() {
    this.cache = {};
  }
  update(range, results) {
    if ({}.hasOwnProperty.call(this.cache, range)) {
      this.cache[range] = [...this.cache[range], ...results];
    } else {
      this.cache[range] = results;
    }
  }
  get(range, length) {
    if (!this.has(range, length)) throw new Error('Not enough data in cache');

    return this.cache[range].slice(0, length);
  }
  remove(range, length) {
    if (!this.has(range, length)) throw new Error('Not enough data in cache');

    return this.cache[range].splice(0, length);
  }
  has(range, length) {
    return (
      {}.hasOwnProperty.call(this.cache, range) &&
      this.cache[range].length >= length
    );
  }
}

export default new Cache();
