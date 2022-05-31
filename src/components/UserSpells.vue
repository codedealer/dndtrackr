<template>
  <div class="user-panel-container">
    <v-overlay
      absolute
      :value="$store.state.server.userLoading"
    >
      <v-progress-circular indeterminate size="40"></v-progress-circular>
    </v-overlay>

    <v-card>

    <v-container fluid class="py-0">
      <v-row>
        <v-col cols="auto">
          <v-text-field
            dense
            hide-details
            filled
            v-model="filter"
            placeholder="Filter"
          ></v-text-field>
        </v-col>
        <v-spacer></v-spacer>
        <v-col cols="auto">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <span v-on="on">
                <v-btn
                  icon
                  class="mr-1"
                  v-bind="attrs"
                  @click="changeSort"
                >
                  <v-icon>{{ sortIcon }}</v-icon>
                </v-btn>
              </span>
            </template>
            <span>{{ sortText }}</span>
          </v-tooltip>

          <v-btn
            icon
            @click="changeDir"
          >
            <v-icon>mdi-arrow-up-down</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-container>

    </v-card>

    <v-list v-if="$store.state.user.state" two-line class="my-3">
      <v-list-item v-for="actor in feed" :key="actor.key">
        <v-list-item-content>
          <v-list-item-title>{{ actor.name }}</v-list-item-title>
          <v-list-item-subtitle>
            <v-chip x-small class="mr-1" color="orange darken-4" v-if="actor.ritual">ritual</v-chip>
            <v-chip x-small class="mr-1" color="red darken-3" v-if="actor.concentration">conc.</v-chip>
          </v-list-item-subtitle>
        </v-list-item-content>

        <v-list-item-action>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon small v-bind="attrs" v-on="on" @click="loadSpell(actor)">
                <v-icon color="">mdi-share-outline</v-icon>
              </v-btn>
            </template>
            <span>Show the spell</span>
          </v-tooltip>
        </v-list-item-action>
      </v-list-item>
    </v-list>
    <div v-else> You need to sign in to see this panel.</div>
  </div>
</template>

<script>
import UserFormMixin from '../utils/userFormMixin';
import { createNamespacedHelpers } from 'vuex';
const { mapState } = createNamespacedHelpers('data');
const { mapMutations, mapActions } = createNamespacedHelpers('server');

export default {
  mixins: [UserFormMixin],

  menu: {
    name: 'User Spells',
    component: 'UserSpells',
    loginRequired: true,
  },

  data: () => ({
    fieldBy: 'spellsOrderBy',
    fieldAsc: 'spellsOrderAsc',
  }),

  computed: {
    ...mapState({
      actors: '_userSpellIndex',
    }),
  },

  methods: {
    ...mapMutations([
      'SET_USER_LOADING',
    ]),
    ...mapActions([
      'getSpell',
    ]),
    async loadSpell (spell) {
      this.SET_USER_LOADING(true);

      await this.getSpell(spell);

      this.SET_USER_LOADING(false);
      this.$store.commit('SET_MENU', 'SpellInfo');
    },
  }
}
</script>