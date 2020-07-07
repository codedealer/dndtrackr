<template>
  <v-app>
    <EncounterDrawer />
    <v-app-bar app dark flat>
      <DiceRoller />

      <v-spacer></v-spacer>

      <Auth />
    </v-app-bar>

    <v-main>
      <v-container class="py-0 main-container">
        <v-row align="stretch">
          <Panel>
            <ActorInfoContainer />
          </Panel>
        </v-row>
      </v-container>

      <Server />
    </v-main>
  </v-app>
</template>

<script>
import DiceRoller from './components/DiceRoller';
import Auth from './components/Auth';
import Server from './components/Server';
import Panel from './components/Panel';
import ActorInfoContainer from './components/ActorInfoContainer';
import EncounterDrawer from './components/EncounterDrawer';

export default {
  name: 'DnDBox',

  components: {
    EncounterDrawer,
    Auth,
    DiceRoller,
    Server,
    Panel,
    ActorInfoContainer,
  },

  data: () => ({
    //
  }),
};
</script>

<style lang="scss">
.main-container {
  height: 100%;
  > .row {
    height: 100%;
    overflow: hidden;
  }
}
</style>