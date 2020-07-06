<template>
  <v-menu open-on-hover bottom offset-y>
    <template v-slot:activator="{ on, attrs }">
      <v-btn
      :color="actor.color.name"
      height="32"
      width="32"
      min-width="32"
      tile
      depressed
      v-bind="attrs"
      v-on="on"
      @click="changeType(index)"
      >
        <div class="icon-type" :class="type"></div>
      </v-btn>
    </template>
    <div class="color-chooser">
      <div class="color-item" v-for="(code, i) in COLORS" :class="{[code.name]: true, 'selected': code.name == actor.color.name}" @click.stop="selectColor({ actorIndex: index, colorIndex: i })"></div>
    </div>
  </v-menu>
</template>

<script>
import TYPES from '../model/ACTOR_TYPES';
import COLORS from '../model/COLORS';
import { createNamespacedHelpers } from 'vuex';

const { mapMutations } = createNamespacedHelpers('encounter');

export default {
  props: ['actor', 'index'],
  data: () => ({
    COLORS,
  }),
  computed: {
    type () {
      return this.actor.type === TYPES.monster ? 'icon-monster' : 'icon-player';
    }
  },
  methods: {
    ...mapMutations({
      changeType: 'CHANGE_ACTOR_TYPE',
      selectColor: 'CHANGE_ACTOR_COLOR',
    }),
  }
}
</script>

<style lang="scss">
.color-chooser {
  display: flex;
}
.color-item {
  height: 23px;
  width: 32px;
  cursor: pointer;
  box-sizing: border-box;
  border: 1px solid #444;
  border-left: none;
  &.selected {
    border-color: #aaa;
    border-left: 1px solid #aaa;
  }
  &.selected + .color-item {
    border-right: none;
  }
}
.icon-type {
  display: inline-block;
  width: 32px;
  height: 32px;
  background-size: contain;
}
.icon-monster {
  background-image: url(../assets/icon-monster.svg);
}
.icon-player {
  background-image: url(../assets/icon-player.svg);
}
.a-red {
  background-color: #ca331a !important;
}
.a-blue {
  background-color: #2775c7 !important;
}
.a-green {
  background-color: #1c9e1c !important;
}
.a-orange {
  background-color: #ca780f !important;
}
.a-purple {
  background-color: #840fca !important;
}
.a-pink {
  background-color: #e678b9 !important;
}
.a-yellow {
  background-color: #d8ca11 !important;
}
</style>