<template>
  <v-app>
    <v-navigation-drawer
      app
      left
      disable-route-watcher
      width="min(350px, 100%)"
    >
    </v-navigation-drawer>
    <v-app-bar app color="blue-grey darken-3" dark flat>
      <DiceRoller />

      <v-spacer></v-spacer>

      <Auth />
    </v-app-bar>

    <v-main>
      <Server />
    </v-main>
  </v-app>
</template>

<script>
import DiceRoller from './components/DiceRoller';
import Auth from './components/Auth';
import Server from './components/Server';

export default {
  name: 'DnDBox',

  components: {
    DiceRoller,
    Auth,
    Server,
  },

  data: () => ({
    //
  }),

  methods: {
    managed () {

    }
  }
};
</script>
