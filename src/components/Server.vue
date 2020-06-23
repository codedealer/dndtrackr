<template>
  <div class="maintenance">
    <v-overlay :value="loading">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
    <v-snackbar v-model="error" bottom centered>{{ errorMsg }}</v-snackbar>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex';

const { mapGetters, mapActions } = createNamespacedHelpers('server');

export default {
  async mounted () {
    await this.$store.restored;
    await this.init();
    this.loading = false;
  },

  data () {
    return {
      loading: true,
    }
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