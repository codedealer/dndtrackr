<template>
  <div class="encounter-list-item" :class="classes" @click="SELECT_ACTOR(actor.uid)">
    <v-tooltip bottom>
      <template v-slot:activator="{ on, attrs }">
        <div class="initiative-counter" v-bind="attrs" v-on="on">
          <input type="text" class="initiative" v-model.number="initiative" @click="initiativeHelper()">
        </div>
      </template>
      <span>Initiative</span>
    </v-tooltip>
    <div class="actor-info-container">
      <div class="actor-toolbar-container">
        <ActorType :actor="actor" :index="index" />
        <Autocomplete
          :list="monsterIndex"
          v-model="name"
          @newKey="onNewKey"
        ></Autocomplete>
        <HitPointWidget :actor="actor" :index="index" v-if="showHitPointWidget" />
      </div>
      <StatusBar :actor="actor" :index="index" />
    </div>
    <div class="actor-action-container">
      <v-btn
      color="error"
      height="55"
      width="32"
      min-width="32"
      tile
      depressed
      @click.stop="REMOVE_ACTOR(index)"
      >
        <v-icon>mdi-skull-crossbones</v-icon>
      </v-btn>
    </div>
    <div class="actor-selected-cursor primary accent-1"></div>
  </div>
</template>

<script>
import ActorType from './ActorType';
import Autocomplete from './Autocomplete';
import StatusBar from './StatusBar';
import HitPointWidget from './HitPointWidget';

import { createNamespacedHelpers } from 'vuex';

const { mapState, mapMutations } = createNamespacedHelpers('encounter');

export default {
  props: ['actor', 'index'],
  data: () => ({}),
  computed: {
    ...mapState([
      'selected'
    ]),
    classes () {
      return {
        selected: this.actor.uid === this.selected,
      }
    },
    initiative: {
      get () { return this.actor.initiative; },
      set (value) {
        this.SET_ACTOR_INITIATIVE({ index: this.index, value });
      }
    },
    name: {
      get () { return this.actor.name; },
      set (value) {
        this.SET_ACTOR_NAME({ index: this.index, value });
      }
    },
    monsterIndex () {
      return this.$store.getters['data/monsterIndex'];
    },
    showHitPointWidget () {
      return {}.hasOwnProperty.call(this.actor.data, 'hit_points') && this.actor.settings.showHitPointWidget;
    }
  },

  methods: {
    ...mapMutations([
      'REMOVE_ACTOR',
      'SELECT_ACTOR',
      'SET_ACTOR_INITIATIVE',
      'SET_ACTOR_NAME',
      'SET_ACTOR_KEY',
    ]),
    initiativeHelper () {
      // if initiative is not set (0) empty the field
      if (this.initiative === 0) {
        this.SET_ACTOR_INITIATIVE({ index: this.index, value: '' });
      }
    },
    async onNewKey (key) {
      this.SET_ACTOR_KEY({ index: this.index, value: key });
      if (this.actor.type === ActorType.monster) {
        await this.$store.dispatch('server/getActorData', { index: this.index, key });
      }
    }
  },

  components: {
    ActorType,
    Autocomplete,
    StatusBar,
    HitPointWidget,
  }
}
</script>

<style lang="scss">
.encounter-list-item {
  display: flex;
  flex: 1 0 100%;
  justify-content: stretch;
  align-content: stretch;
  height: 56px;
  border-bottom: 1px solid rgba(255, 255, 255, .12);
  position: relative;
  .actor-selected-cursor {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 3px;
    display: none;
  }
  &.selected .actor-selected-cursor {
    display: block;
  }
}
.initiative-counter {
  flex: 0 0 auto;
  width: 32px;
}
.initiative {
  text-align: center;
  font-size: 24px;
  line-height: 55px;
  padding: 0;
  width: 100%;
  border: none;
  outline: none;
  color: #fff;
  background-color: #424242;
  transition: background-color .2s ease-in-out;
  &:hover {
    background-color: #616161;
  }
}
.actor-info-container {
  flex: 1 0 auto;
  max-width: calc(100% - 64px);
}
.actor-toolbar-container {
  height: 33px;
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, .12);
}
.actor-input-container {
  height: 32px;
  flex: 1 0 auto;
}
.actor-input {
  padding: 0 5px;
  height: 32px;
  line-height: 32px;
  border: none;
  outline: none;
  color: #fff;
  width: 100%;
  max-width: 100%;
  background-color: #424242;
  &:hover {
    background-color: #616161;
  }
  transition: background-color .2s ease-in-out;
}
</style>