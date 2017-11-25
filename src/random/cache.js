export default {
  cache: {},
  update (range, results) {
    if (this.cache.hasOwnProperty(range)) {
      this.cache[range] = [...this.cache[range], ...results];
    } else {
      this.cache[range] = results;
    }
  },
  get (range, length) {
    if (!this.has(range, length)) throw new Error('Not enough data in cache');

    return this.cache[range].splice(0, length);
  },
  has (range, length) {
    return this.cache.hasOwnProperty(range) && this.cache[range].length >= length;
  }
}
