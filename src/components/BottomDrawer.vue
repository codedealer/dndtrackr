<template>
  <div class="bottom-drawer-pad">
    <div class="bottom-drawer" :class="{ expanded }">
      <v-toolbar dark flat>
        <RoundCounter v-show="$store.state.encounter.actors.length" />

        <v-divider vertical class="mr-3"></v-divider>

        <v-window
        v-model="current"
        vertical
        >
          <v-window-item
            value="0"
          >
            <v-btn text block>0 XP</v-btn>
          </v-window-item>
          <v-window-item
            value="1"
          >
            <v-btn text block>+ 100XP undo</v-btn>
          </v-window-item>
        </v-window>

      </v-toolbar>
    </div>
  </div>
</template>

<script>
import RoundCounter from './RoundCounter';

export default {
  data: () => ({
    expanded: false,
    current: 0,
  }),

  components: {
    RoundCounter,
  }
}
</script>

<style lang="scss">
.bottom-drawer-pad {
  height: 64px;
}
.bottom-drawer {
  position: absolute;
  left: 0;
  bottom: 0;
  right: 0;
  height: calc(100vh - 64px);
  transform: translateY(calc(100vh - 128px));
  transition: transform .4s ease-in-out;
  background: #363636;
  &.expanded {
    transform: translateY(0);
  }
}
</style>