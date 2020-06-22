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
      transition="slide-y-transition"
    >
      <template #activator="{ on, attrs }">
         <v-btn
          fab
          depressed

          color="btnColor"
          v-on="on"
          v-bind="attrs"
        >
          <v-icon v-show="!user.photo">mdi-account</v-icon>
          <v-avatar v-show="user.photo" height="56" width="56">
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
          </v-list-item>
          <v-divider></v-divider>
        </v-list>

        <v-card-actions>

          <v-spacer></v-spacer>
          <v-btn color="primary" @click="signOut">Sign Out</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-menu>
  </div>
</template>

<script>
import { createNamespacedHelpers, mapState } from 'vuex';

const { mapActions } = createNamespacedHelpers('server');

export default {
  data: () => ({
    //
  }),

  computed: {
    state () { return this.$store.state.user.state; },
    btnColor () { return this.$store.state.user.photo ? 'transparent' : 'primary'},
    ...mapState(['user'])
  },

  methods: {
    ...mapActions(['signIn', 'signOut'])
  }
}
</script>