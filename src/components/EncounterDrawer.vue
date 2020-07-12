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
            :loading="initiativeLoading"
            fab
            height="48" width="48"
            v-bind="attrs" v-on="on"
            @click.exact="initiative()"
            @click.ctrl="initiative(true)"
            @click.meta="initiative(true)"
          >
            <v-icon x-large>mdi-dice-d20-outline</v-icon>
          </v-btn>
        </template>
        <p class="mb-1">Generate initiative<br>Hold ctrl to re-generate everyone's<br>initiative (players ignored)</p>
      </v-tooltip>

      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            color="primary lighten-1"
            class="ml-2"
            fab
            height="48" width="48"
            v-bind="attrs" v-on="on"
            @click.exact="sortActors()"
          >
            <v-icon x-large>mdi-sort-variant</v-icon>
          </v-btn>
        </template>
        <span>Sort by initiative</span>
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
import { createNamespacedHelpers } from 'vuex';

const { mapState, mapMutations, mapActions } = createNamespacedHelpers('encounter');

export default {
  data: () => ({
    initiativeLoading: false,
  }),

  computed: {
    ...mapState(['actors']),
  },

  methods: {
    ...mapMutations({
      addActor: 'ADD_ACTOR',
      sortActors: 'SORT_ACTORS',
    }),
    ...mapActions([
      'generateInitiative',
    ]),
    async initiative(regenerate) {
      this.initiativeLoading = true;
      try {
        await this.generateInitiative(regenerate);
      } catch (e) {
        console.error(e.message);
      } finally {
        this.initiativeLoading = false;
      }
    },
  },

  components: {
    Actor,
  }
}
</script>