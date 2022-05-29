<template>
  <v-navigation-drawer
    app
    left
    disable-route-watcher
    width="min(350px, 100%)"
    v-hotkey.stop="keymap"
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

      <div v-show="showButtons">
        <v-tooltip bottom key="0" >
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

        <v-tooltip bottom key="1">
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              color="primary lighten-1"
              class="ml-2"
              fab
              height="48" width="48"
              v-bind="attrs" v-on="on"
              @click.exact="sortActors()"
            >
              <v-icon>mdi-sort-variant</v-icon>
            </v-btn>
          </template>
          <span>Sort by initiative</span>
        </v-tooltip>

        <v-tooltip bottom key="2">
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              color="primary lighten-1"
              class="ml-2"
              fab
              height="48" width="48"
              v-bind="attrs" v-on="on"
              @click="renameDuplicates()"
            >
              <v-icon>mdi-pencil-box-multiple-outline</v-icon>
            </v-btn>
          </template>
          <span>Rename duplicates</span>
        </v-tooltip>
      </div>

    </v-toolbar>

    <v-slide-x-transition group tag="div" class="encounter-list">
      <Actor
        :actor="actor"
        :index="i"
        :queryParser="queryParser"
        v-for="(actor, i) in actors"
        :key="actor.uid"
      ></Actor>
    </v-slide-x-transition>

    <template v-slot:append>
      <BottomDrawer />
    </template>
  </v-navigation-drawer>
</template>

<script>
import Actor from './Actor';
import BottomDrawer from './BottomDrawer';
import QueryParser from '../utils/QueryParser';
import { createNamespacedHelpers } from 'vuex';

const { mapState, mapMutations, mapActions } = createNamespacedHelpers('encounter');

export default {
  mounted () {
    this.queryParser.add('#', 'actor_tags')
                    .add('@=', 'challenge_rating', { intSearch: 'eq' })
                    .add('@>', 'challenge_rating', { intSearch: 'gt' })
                    .add('@<', 'challenge_rating', { intSearch: 'lt' })
                    .add('!t', 'type', { fullSearch: true })
                    .add('!s', 'subtype', { fullSearch: true })
                    ;
  },

  data: () => ({
    initiativeLoading: false,
    queryParser: new QueryParser(),
  }),

  computed: {
    ...mapState(['actors', 'selected']),
    showButtons () { return this.actors.length },
    keymap () {
      return {
        down: this.down,
        up: this.up,
        'delete': this.remove,
        backspace: this.remove,
      }
    }
  },

  methods: {
    ...mapMutations({
      addActor: 'ADD_ACTOR',
      sortActors: 'SORT_ACTORS',
      renameDuplicates: 'RENAME_ACTORS',
      selectActor: 'SELECT_ACTOR',
    }),
    ...mapActions([
      'generateInitiative',
      'removeActor',
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
    down () {
      if (!this.actors.length) return;
      if (this.selected === false) this.selectActor(this.actors[0].uid);

      const i = this.actors.findIndex(a => a.uid === this.selected);
      if (i === -1) return;
      if (i === this.actors.length - 1) {
        this.selectActor(this.actors[0].uid);
      } else {
        this.selectActor(this.actors[i + 1].uid);
      }
    },
    up () {
      if (!this.actors.length) return;
      if (this.selected === false) this.selectActor(this.actors[0].uid);

      const i = this.actors.findIndex(a => a.uid === this.selected);
      if (i === -1) return;
      if (i === 0) {
        this.selectActor(this.actors[this.actors.length - 1].uid);
      } else {
        this.selectActor(this.actors[i - 1].uid);
      }
    },
    remove () {
      if (!this.actors.length || this.selected === false) return;

      const i = this.actors.findIndex(a => a.uid === this.selected);
      if (i === -1) return;
      this.removeActor(i);
    },
  },

  components: {
    Actor,
    BottomDrawer,
  }
}
</script>