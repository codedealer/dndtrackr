<template>
  <v-btn-toggle class="mr-3">
    <v-btn @click="next"><v-icon>mdi-chevron-right</v-icon></v-btn>
    <v-btn @click="reset"><v-icon>mdi-reload</v-icon></v-btn>
    <v-tooltip top>
      <template v-slot:activator="{ on, attrs }">
          <v-btn v-on="on" v-bind="attrs">
            <span class="text-subtitle-1">{{ round }}</span>
          </v-btn>
      </template>
      <span>Round counter</span>
    </v-tooltip>
  </v-btn-toggle>
</template>

<script>
import { createNamespacedHelpers } from 'vuex';
const { mapState, mapActions } = createNamespacedHelpers('roundCounter');

export default {
  data: () => ({}),

  computed: {
    ...mapState(['round']),
  },

  methods: {
    ...mapActions(['next', 'reset']),
  }
}
</script>