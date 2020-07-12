<template>
  <v-window
  v-model="current"
  vertical
  >
    <v-window-item
      v-for="(actor, index) in actors"
      :key="actor.uid"
      :value="index"
    >
      <ActorInfo
        :actor="actor"
        :index="index"
        :key="actor.uid"
      ></ActorInfo>
    </v-window-item>
  </v-window>
</template>

<script>
import { createNamespacedHelpers } from 'vuex';
import ActorInfo from './ActorInfo';

const { mapState, mapMutations } = createNamespacedHelpers('encounter');

export default {
  data: () => ({}),

  computed: {
    ...mapState(['actors', 'selected']),
    current: {
      get () {
        return this.actors.findIndex(actor => actor.uid === this.selected);
      },
      set (index) {
        let actor = this.actors[index];
        if (!actor || !actor.uid) return;

        this.SELECT_ACTOR(actor.uid);
      }
    },
  },

  methods: {
    ...mapMutations([
      'SELECT_ACTOR',
    ])
  },

  components: {
    ActorInfo,
  }
}
</script>