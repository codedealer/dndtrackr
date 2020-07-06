export default {
  methods: {
    deleteStatus (index) {
      this.$store.commit('encounter/DELETE_STATUS', { actorIndex: this.index, statusIndex: index });
    }
  }
}