<template>
  <v-snackbar v-model="error" bottom centered>{{ errorMsg }}</v-snackbar>
</template>

<script>
import { createNamespacedHelpers } from 'vuex';

const { mapGetters, mapActions } = createNamespacedHelpers('server');

export default {
  mounted () {
    this.init();
  },

  computed: {
    error: {
      get () { return this.$store.getters['server/error'] },
      set (value) {
        this.$store.commit('server/SET_ERROR', value);
      }
    },
    ...mapGetters([
      'errorMsg'
    ]),
  },

  methods: {
    ...mapActions(['init']),
  }
}
</script>