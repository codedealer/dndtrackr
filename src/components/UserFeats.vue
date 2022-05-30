<template>
  <div class="user-panel-container">
    <v-overlay
      absolute
      :value="$store.state.server.userLoading"
    >
      <v-progress-circular indeterminate size="40"></v-progress-circular>
    </v-overlay>

    <v-card class="sticky-card">
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
            <FeatForm></FeatForm>

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

    <v-list v-if="$store.state.user.state"  class="my-3">
      <v-list-item v-for="actor in feed" :key="actor.key">
        <v-list-item-content>
          <v-list-item-title>{{ actor.name }}</v-list-item-title>
        </v-list-item-content>

        <v-list-item-action>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon small v-bind="attrs" v-on="on" @click="edit(actor)">
                <v-icon color="">mdi-pen</v-icon>
              </v-btn>
            </template>
            <span>Edit</span>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon small v-bind="attrs" v-on="on" @click="remove(actor)">
                <v-icon color="primary">mdi-delete</v-icon>
              </v-btn>
            </template>
            <span>Remove</span>
          </v-tooltip>
        </v-list-item-action>
      </v-list-item>
    </v-list>
    <div v-else>You need to sign in to see this panel.</div>

  </div>
</template>

<script>
import UserFormMixin from '../utils/userFormMixin';
import FeatForm from './Forms/FeatForm';
import { createNamespacedHelpers } from 'vuex';
const { mapState } = createNamespacedHelpers('data');
const { mapActions } = createNamespacedHelpers('feats');

export default {
  mixins: [UserFormMixin],

  data: () => ({
    fieldBy: 'featsOrderBy',
    fieldAsc: 'featsOrderAsc',
  }),

  computed: {
    ...mapState({
      actors: '_userFeatIndex',
    }),
  },

  methods: {
    ...mapActions(['edit', 'remove']),
  },

  components: {
    FeatForm,
  }
}
</script>