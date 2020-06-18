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

      <v-btn
        href="https://github.com/vuetifyjs/vuetify/releases/latest"
        target="_blank"
        text
      >
        <span class="mr-2">Latest Release</span>
        <v-icon>mdi-open-in-new</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main></v-main>
  </v-app>
</template>

<script>
import DiceRoller from './components/DiceRoller';

export default {
  name: 'DnDBox',

  components: {
    DiceRoller
  },

  data: () => ({
    //
  })
};
</script>
