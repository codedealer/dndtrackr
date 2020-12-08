<template>
  <div class="bottom-drawer-pad">
    <div class="bottom-drawer" :class="{ expanded }">
      <v-toolbar dark flat>
        <RoundCounter v-show="$store.state.encounter.actors.length" />

        <v-divider vertical class="mr-3" v-show="$store.state.encounter.actors.length"></v-divider>

        <v-window
        v-model="current"
        class="flex-grow-1"
        vertical
        >
          <v-window-item
            value="0"
          >
            <v-btn text block @click="expanded = !expanded">
              <div class="xp-btn-wrapper">
                <div>{{ totalXp }} XP</div>
                <div v-show="isPerPlayer" class="xp-per-player">{{ xpPerPlayer }} XP per player</div>
              </div>
            </v-btn>
          </v-window-item>
          <v-window-item
            value="1"
          >
            <v-btn text @click="expanded = !expanded">+ {{ latestXp }}XP</v-btn>
            <v-btn color="error" icon @click="dismiss">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </v-window-item>
        </v-window>
      </v-toolbar>

      <div class="xp-list-container">
        <div class="action-bar">
          <v-text-field
              v-model="xpModel"
              hide-details
              dense
              outlined
              label="Additional xp"
              @keydown.enter.self.prevent="addXp"
            >
            <template v-slot:append-outer>
              <v-btn color="error" @click="clear">Clear the list</v-btn>
            </template>
          </v-text-field>
        </div>

        <v-list
          two-line
          subheader
          class="xp-list"
        >
          <template v-for="(record, i) in feed">
            <v-subheader v-if="i == 0 || subheaderMap[i]" :key="'div' + record.actor.uid">Players: {{ record.playerQty }}</v-subheader>

            <v-list-item :key="record.actor.uid">
              <v-list-item-avatar height="32" width="32">
                <div class="icon-type" :class="record.actor.type == types.monster ? 'icon-monster' : 'icon-player'"></div>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title>{{ record.actor.name }}</v-list-item-title>
                <v-list-item-subtitle v-if="record.actor.type == types.monster">
                  <span v-if="!isPerPlayer || record.playerQty > 0">XP: {{ record.actor.data.xp }}</span>
                  <i v-else>Ignored (no players to share xp)</i>
                </v-list-item-subtitle>
                <v-list-item-subtitle v-else><i>Player</i></v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn icon small v-bind="attrs" v-on="on" @click="restoreRecord(record)">
                      <v-icon color="">mdi-share-outline</v-icon>
                    </v-btn>
                  </template>
                  <span>Restore</span>
                </v-tooltip>

                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn icon small v-bind="attrs" v-on="on" @click="removeRecord(record)">
                      <v-icon color="error">mdi-delete</v-icon>
                    </v-btn>
                  </template>
                  <span>Remove completely</span>
                </v-tooltip>
              </v-list-item-action>
            </v-list-item>
          </template>
        </v-list>
      </div>
    </div>
  </div>
</template>

<script>
import RoundCounter from './RoundCounter';
import TYPES from '../model/ACTOR_TYPES';
import { createNamespacedHelpers } from 'vuex';

const { mapGetters, mapActions } = createNamespacedHelpers('xpTracker');

export default {
  data: () => ({
    expanded: false,
    types: TYPES,
    additionalXp: 0,
    xpModel: '',
  }),

  computed: {
    ...mapGetters([
      'feed',
      'showLatest'
    ]),
    current () { return this.showLatest ? '1' : '0'; },
    latestXp () {
      if (this.feed.length === 0) return 0;
      return this.feed[0].actor.data.xp;
    },
    subheaderMap () {
      let last = 0;
      return this.feed.map(record => {
        if (last === record.playerQty) return false;

        last = record.playerQty;
        return true;
      });
    },
    isPerPlayer () {
      // whether or not to count xp per player or just total
      return this.feed.some(r => r.playerQty > 0);
    },
    totalXp () {
      return this.feed.reduce((prev, cur) => {
        if (this.isPerPlayer && cur.playerQty === 0) return prev;
        if (cur.actor.type === this.types.character) return prev;

        return prev + this.getXp(cur.actor.data.xp);
      }, 0) + this.additionalXp;
    },
    xpPerPlayer () {
      if (!this.isPerPlayer) return 0;
      if (this.activePlayers === 0) return 0; // we do not want to divide by 0

      return Math.round(this.totalXp / this.activePlayers);
    },
    activePlayers () {
      return this.$store.getters['encounter/characters'].length;
    },
  },

  methods: {
    ...mapActions([
      'removeRecord',
      'restoreRecord',
      'clearRecords',
    ]),
    getXp (xp) {
      if (!xp) return 0;
      let intXp = parseInt(xp);
      return isNaN(intXp) ? 0 : intXp;
    },
    addXp () {
      let intXp = parseInt(this.xpModel);
      intXp = isNaN(intXp) ? 0 : intXp;
      this.additionalXp += intXp;
      this.xpModel = '';
    },
    clear () {
      this.additionalXp = 0;
      this.clearRecords();
    },
    dismiss () {
      this.removeRecord(this.feed[0]);
    },
  },

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
.xp-list-container {
  overflow-y: auto;
  height: calc(100% - 64px);
  scrollbar-width: 0;
  &::-webkit-scrollbar {
    display: none;
  }
  .v-list-item[aria-disabled="true"] .icon-type {
    opacity: .7;
  }
  .xp-list {
    > .v-list-item > .v-list-item__avatar {
      margin-bottom: 8px;
      margin-top: 8px;
    }
  }
  .action-bar {
    margin: 15px 15px 0;
    > .v-text-field--enclosed.v-input--dense:not(.v-text-field--solo) > .v-input__append-outer {
      margin-top: 2px;
    }
  }
}
.xp-per-player {
  text-transform: none;
  font-size: 10px;
}
</style>