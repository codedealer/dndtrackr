<template>
  <v-app>
    <EncounterDrawer />
    <v-app-bar app dark flat>
      <DiceRoller />

      <v-spacer></v-spacer>

      <Help />
      <SecondaryMenu />
      <Auth />
    </v-app-bar>

    <v-main>
      <v-container class="py-0 main-container">
        <v-row align="stretch">
          <Panel>
            <ActorInfoContainer />
          </Panel>
          <Panel class="secondary-panel">
            <SecondaryInfoContainer />
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
import Help from './components/Help';
import Server from './components/Server';
import Panel from './components/Panel';
import ActorInfoContainer from './components/ActorInfoContainer';
import SecondaryInfoContainer from './components/SecondaryInfoContainer';
import EncounterDrawer from './components/EncounterDrawer';
import SecondaryMenu from './components/SecondaryMenu';

export default {
  name: 'DnDBox',

  components: {
    EncounterDrawer,
    Auth,
    Help,
    DiceRoller,
    Server,
    Panel,
    ActorInfoContainer,
    SecondaryInfoContainer,
    SecondaryMenu,
  },

  data: () => ({
    //
  }),
};
</script>

<style lang="scss">
$panel-text-color: #dbd8df;
.main-container {
  height: 100%;
  > .row {
    height: 100%;
    overflow: hidden;
  }
}
.secondary-panel {
  background-color: #1f181c;
}
.actor-form-container {
  padding: 0 5px;
  color: $panel-text-color;
  .actor-form-name {
    font-size: 32px;
    input {
      max-height: 50px;
    }
    > .v-input__control > .v-input__slot:before {
      border-color: transparent;
    }
  }
  .actor-divider {
    height: 2px;
    background-color: currentColor;
    margin: 10px 0;
  }
  .actor-subheader {
    display: flex;
    font-style: italic;
    color: #bebebe;
    /*.actor-text-field.v-input > .v-input__control input {
      color: #bebebe;
    }*/
  }
  .actor-attributes-container {
    display: flex;
    justify-content: space-around;
    padding-bottom: 10px;
  }
  .v-btn.actor-label-text-btn,
  .v-btn.actor-label-btn {
    text-transform: none;
    padding-left: 0px;
    padding-right: 2px;
    min-width: 20px;
    margin-right: 10px;
    margin-bottom: 6px;
    font-size: 16px;
    font-weight: 700;
    letter-spacing: normal;
    height: 24px;
    vertical-align: inherit;
    justify-content: flex-start;
  }
}
.actor-textarea-wrapper {
  margin-bottom: 10px;
}
.textarea-label-wrapper {
  line-height: 25px;
  white-space: break-spaces;
  .v-btn.actor-label-text-btn {
    margin-bottom: 0;
  }
}
.actor-notes-container {
  margin: 10px 0;
}
.user-panel-container {
  position: relative;
}
.sticky-card {
  position: sticky;
  top: -12px;
  z-index: 2;
}
</style>