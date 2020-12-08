const sourceParser = {
  data: () => ({
    sourceCache: new Map(),
  }),

  computed: {
    userProxy () { return this.$store.state.user },
  },

  methods: {
    sourceIcon (tag) {
      if (tag === this.userProxy.uid) return 'self';
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