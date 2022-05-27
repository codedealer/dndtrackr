export default {
  data: () => ({
    filter: '',
  }),

  computed: {
    feed () {
      let f = [];
      if (this.filter === '') {
        f = this.actors.slice();
      } else {
        f = this.actors.filter(a => a.name.toLowerCase().startsWith(this.filter.toLowerCase()));
      }

      f.sort((a, b) => {
        if (a[this.orderBy] === b[this.orderBy]) return 0;
        if (this.orderAsc) {
          return a[this.orderBy] > b[this.orderBy] ? 1 : -1;
        } else {
          return a[this.orderBy] > b[this.orderBy] ? -1 : 1;
        }
      });

      return f;
    },
    orderBy () {
      return this.$store.state.user.settings[this.fieldBy];
    },
    orderAsc () {
      return this.$store.state.user.settings[this.fieldAsc];
    },
    sortIcon () {
      const order = !this.orderAsc ? 'ascending' : 'descending';
      const icon = this.orderBy === 'name' ? 'sort-alphabetical' : 'sort-clock';
      return `mdi-${icon}-${order}`;
    },
    sortText () {
      return this.orderBy === 'name' ? 'Sort by name' : 'Sort by date';
    },
  },

  methods: {
    changeSort () {
      const newSort = this.orderBy === 'name' ? 'key' : 'name';
      this.$store.commit('UPDATE_USER_SETTINGS', { [this.fieldBy]: newSort });
    },
    changeDir () {
      this.$store.commit('UPDATE_USER_SETTINGS', { [this.fieldAsc]: !this.orderAsc });
    },
  }
}