<template>
  <div class="encounter-list-item" :class="classes" @click="SELECT_ACTOR(actor.uid)">
    <v-tooltip bottom>
      <template v-slot:activator="{ on, attrs }">
        <div class="initiative-counter" v-bind="attrs" v-on="on">
          <input
            type="text"
            class="initiative"
            v-model.number="initiative"
            @click="initiativeHelper()"
            :tabindex="1+index"
          >
        </div>
      </template>
      <span>Initiative</span>
    </v-tooltip>
    <div class="actor-info-container">
      <div class="actor-toolbar-container">
        <ActorType :actor="actor" :index="index" />
        <Autocomplete
          :list="monsterIndex"
          :filter="filteredInput"
          classInput="actor-input"
          classWrapper="actor-input-container"
          v-model="name"
          @choice="onNewKey"
          @traverse="onTraverse"
          v-slot="{ item }"
        >
          <div class="autocomplete-item-title">{{ item.name }}</div>
          <div class="autocomplete-item-subtitle">
            <v-chip x-small class="mr-1" color="purple darken-4">{{ item.type }}</v-chip>
            <v-chip x-small class="mr-1" color="red darken-3">CR {{ item.challenge_rating }}</v-chip>
            <v-chip x-small class="mr-1">{{ sourceIcon(item.tag) }}</v-chip>
            <v-chip
              v-if="Array.isArray(item.actor_tags)"
              v-for="tag in item.actor_tags"
              x-small
              class="mr-1"
            >{{ tag }}</v-chip>
          </div>
        </Autocomplete>
        <HitPointWidget
          :actor="actor"
          :index="index"
          :loading="hitPointsLoading"
          v-if="showHitPointWidget"
        ></HitPointWidget>
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
      @click.stop="removeActor(index)"
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
import parser from '../parser';
import TYPES from '../model/ACTOR_TYPES';
import Status from '../model/status';
import sourceParser from '../utils/sourceParser';

import { createNamespacedHelpers } from 'vuex';

const { mapState, mapMutations, mapActions } = createNamespacedHelpers('encounter');

export default {
  mixins: [sourceParser],
  props: ['actor', 'index', 'queryParser'],

  data: () => ({
    hitPointsLoading: false,
  }),

  computed: {
    ...mapState([
      'selected',
      'keyMessagePipe',
    ]),
    isTurn () {
      return this.index === this.$store.state.roundCounter.order;
    },
    classes () {
      return {
        selected: this.actor.uid === this.selected,
        ['is-turn']: this.index === this.$store.state.roundCounter.order,
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
    filteredInput () {
      return this.queryParser.getFilteredValue(this.name);
    },
    queryParameters () {
      return this.queryParser.getQueryParameters(this.name);
    },
    monsterIndex () {
      return this.queryParser.filter(this.$store.getters['data/monsterIndex'], this.queryParameters);
    },
    showHitPointWidget () {
      return {}.hasOwnProperty.call(this.actor.data, 'hit_points') && this.actor.settings.showHitPointWidget;
    }
  },

  methods: {
    ...mapMutations([
      'ADD_ACTOR',
      'SELECT_ACTOR',
      'SET_ACTOR_INITIATIVE',
      'SET_ACTOR_NAME',
      'SET_ACTOR_KEY',
      'ADD_STATUS',
      'RESET_STATUS',
      'SET_KEY_MESSAGE',
    ]),
    ...mapActions([
      'removeActor',
    ]),
    initiativeHelper () {
      // if initiative is not set (0) empty the field
      if (this.initiative === 0) {
        this.SET_ACTOR_INITIATIVE({ index: this.index, value: '' });
      }
    },
    moveNext () {
      const nextIndex = this.index + 1;
      const inputs = document.querySelectorAll('.actor-input');
      if (nextIndex < inputs.length) inputs[nextIndex].focus();
    },
    onTraverse () {
      if (this.$store.state.encounter.actors.length - 1 > this.index) {
        // if not last element advance focus
        this.moveNext();
        return;
      } else {
        this.ADD_ACTOR();
        this.$nextTick(() => { this.moveNext(); });
      }
    },
    async onNewKey (item) {
      const key = item.key;
      this.SET_ACTOR_KEY({ index: this.index, value: key });

      try {
        await this.$store.dispatch('server/getActor', { index: this.index, actor: this.actor });
      } catch (e) {
        console.error(e);
        return;
      }

      // reset status of a newly created actor
      this.RESET_STATUS(this.index);

      // set armor class status automatically
      if (this.actor.data.armor_class) {
        this.ADD_STATUS({
          index: this.index,
          status: new Status({
            name: this.actor.data.armor_class,
            showInBar: true,
            deletable: false,
            icon: 'mdi-shield',
          }),
        });
      }

      // generate hitpoints if applicable
      if (this.$store.state.user.settings.randomHitpoints && this.actor.data.hit_dice) {
        this.hitPointsLoading = true;

        let diceParams;
        try {
          diceParams = parser.parse(this.actor.data.hit_dice);
        } catch (e) {
          console.error(e.message);
          this.hitPointsLoading = false;
          return;
        }

        try {
          await this.$store.dispatch('diceRoller/rollHitDice', { diceParams, index: this.index });
        } catch (e) {
          console.error(e);
        } finally {
          this.hitPointsLoading = false;
        }
      }
    }
  },

  watch: {
    keyMessagePipe (value) {
      if (!value) return;
      if (this.actor.uid !== this.selected) return;

      this.onNewKey({ key: value });
      this.SET_KEY_MESSAGE('');
    },
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
.is-turn .initiative {
  background: linear-gradient(180deg, #424242, #e73c7e);
  background-size: 100% 200%;
  animation: gradient 5s ease infinite;
}
@keyframes gradient {
  0% {
    background-position: 0% 0%;
  }
  50% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 0% 0%;
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