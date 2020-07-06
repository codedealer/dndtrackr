const sourceParser = {
  data: () => ({
    sourceCache: new Map(),
  }),

  methods: {
    sourceIcon (tag) {
      if (this.sourceCache.has(tag)) {
        return this.sourceCache.get(tag);
      }

      const words = tag.toUpperCase().split(' ').map(word => word[0]).join('');
      this.sourceCache.set(tag, words);
      return words;
    }
  }
}

export default sourceParser;