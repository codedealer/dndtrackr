<template>
  <v-navigation-drawer
    app
    left
    disable-route-watcher
    width="min(350px, 100%)"
  >
    <v-toolbar dark flat>
      <v-btn
        color="primary"
        fab
        height="48" width="48"
        @click="addActor()"
      >
        <v-icon>mdi-account-plus</v-icon>
      </v-btn>

      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            color="primary lighten-1"
            class="ml-2"
            fab
            height="48" width="48"
            v-bind="attrs" v-on="on"
            @click.exact="generateInitiative()"
            @click.ctrl="generateInitiative(true)"
            @click.meta="generateInitiative(true)"
          >
            <v-icon x-large>mdi-dice-d20-outline</v-icon>
          </v-btn>
        </template>
        <p class="mb-1">Generate initiative<br>Hold ctrl to re-generate everyone's<br>initiative (players ignored)</p>
      </v-tooltip>

    </v-toolbar>

    <v-slide-x-transition group tag="div" class="encounter-list">
      <Actor
        :actor="actor"
        :index="i"
        v-for="(actor, i) in actors"
        :key="actor.uid"
      ></Actor>
    </v-slide-x-transition>
  </v-navigation-drawer>
</template>

<script>
import Actor from './Actor';
import ActorTypes from '../model/ACTOR_TYPES';
import parser from '../parser';
import { createNamespacedHelpers } from 'vuex';

const { mapState, mapMutations } = createNamespacedHelpers('encounter');

export default {
  data: () => ({}),

  computed: {
    ...mapState(['actors']),
  },

  methods: {
    ...mapMutations({
      addActor: 'ADD_ACTOR',
    }),
    async generateInitiative (force = false) {
      const eligibleActors = this.actors.filter(actor => {
        if (actor.type === ActorTypes.player) return false;

        if (force) return true;
        return !actor.initiative;
      });


    }
  },

  components: {
    Actor,
  }
}
</script>