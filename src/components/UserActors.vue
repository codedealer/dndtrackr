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
        <v-list-item-avatar height="32" width="32">
          <div class="icon-type" :class="actor.actor_type == types.monster ? 'icon-monster' : 'icon-player'"></div>
        </v-list-item-avatar>

        <v-list-item-content>
          <v-list-item-title>{{ actor.name }}</v-list-item-title>
          <v-list-item-subtitle>
            <v-chip x-small class="mr-1" color="purple darken-4" v-if="actor.type">{{ actor.type }}</v-chip>
            <v-chip x-small class="mr-1" color="red darken-3" v-if="actor.challenge_rating">CR {{ actor.challenge_rating }}</v-chip>
            <v-chip
              v-if="Array.isArray(actor.actor_tags)"
              v-for="tag in actor.actor_tags"
              x-small
              class="mr-1"
            >{{ tag }}</v-chip>
          </v-list-item-subtitle>
        </v-list-item-content>

        <v-list-item-action>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon small v-bind="attrs" v-on="on" @click="addActor(actor)">
                <v-icon color="">mdi-share-outline</v-icon>
              </v-btn>
            </template>
            <span>Put on the list</span>
          </v-tooltip>
        </v-list-item-action>
      </v-list-item>
    </v-list>
    <div v-else> You need to sign in to see this panel.</div>
  </div>
</template>

<script>
import TYPES from '../model/ACTOR_TYPES';
import UserFormMixin from '../utils/userFormMixin';
import { createNamespacedHelpers } from 'vuex';
const { mapState } = createNamespacedHelpers('data');
const { mapMutations } = createNamespacedHelpers('encounter');

export default {
  mixins: [UserFormMixin],

  data: () => ({
    types: TYPES,
    fieldBy: 'actorsOrderBy',
    fieldAsc: 'actorsOrderAsc',
  }),

  computed: {
    ...mapState({
      actors: '_userMonsterIndex',
    }),
  },

  methods: {
    ...mapMutations([
      'ADD_ACTOR',
      'SET_KEY_MESSAGE',
    ]),
    addActor (actor) {
      this.ADD_ACTOR();
      this.$nextTick().then(() => { this.SET_KEY_MESSAGE(actor.key); });
    },
  }
}
</script>