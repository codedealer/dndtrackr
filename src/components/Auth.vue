<template>
  <div>
    <v-btn
      @click="signIn"
      text
      v-show="!state"
    >
      <v-icon>mdi-google</v-icon>
      <span class="ml-2">Sign in</span>
    </v-btn>
    <v-menu
      v-if="state"
      offset-y
      :close-on-content-click="false"
      transition="slide-y-transition"
    >
      <template #activator="{ on, attrs }">
         <v-btn
          fab
          depressed
          height="48" width="48"
          color="btnColor"
          v-on="on"
          v-bind="attrs"
          :loading="$store.state.server.userLoading"
        >
          <v-icon v-show="!user.photo">mdi-account</v-icon>
          <v-avatar v-show="user.photo" height="48" width="48">
            <img :src="user.photo">
          </v-avatar>
        </v-btn>
      </template>

      <v-card>
        <v-list>
          <v-list-item>
            <v-list-item-avatar v-show="user.photo">
              <img :src="user.photo">
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>{{user.displayName}}</v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn icon @click="signOut"><v-icon>mdi-logout</v-icon></v-btn>
            </v-list-item-action>
          </v-list-item>

          <v-divider></v-divider>

          <v-list-item-group
            v-model="m"
            active-class=""
          >
            <v-list-item value="UserActors">
              <v-list-item-content>
                <v-list-item-title>Actors</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item value="UserSpells">
              <v-list-item-content>
                <v-list-item-title>Spells</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>

        <v-divider></v-divider>

        <v-list>
          <v-list-item>
            <v-list-item-action>
              <v-switch color="primary" v-model="randomHitpoints"></v-switch>
            </v-list-item-action>
            <v-list-item-title>Generate random hitpoints</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card>
    </v-menu>
  </div>
</template>

<script>
import { createNamespacedHelpers, mapState } from 'vuex';

const { mapActions } = createNamespacedHelpers('server');

export default {
  data: () => ({}),

  computed: {
    state () { return this.$store.state.user.state; },
    btnColor () { return this.$store.state.user.photo ? 'transparent' : 'primary'},
    randomHitpoints: {
      get () { return this.$store.state.user.settings.randomHitpoints; },
      set (value) {
        this.updateUserSettings({ randomHitpoints: value });
      }
    },
    m: {
      get () { return this.$store.state.secondaryMenu },
      set (value) {
        this.$store.commit('SET_MENU', value);
      }
    },
    ...mapState(['user'])
  },

  methods: {
    ...mapActions([
      'signIn',
      'signOut',
    ]),
    updateUserSettings (settings) {
      this.$store.dispatch('updateUserSettings', settings);
    },
  }
}
</script>