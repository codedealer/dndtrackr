<template>
  <div class="d-flex align-center dice-roller-wrapper" v-hotkey.stop="keymap">
    <v-text-field
      filled
      placeholder="1d20 + 2d4 + 3"
      id="dice-roller-input"
      dense
      hide-details
      color="#fff"
      v-model="dice"
      :rules="[parser.test]"
      autocomplete="off"
      @keydown.enter.self.prevent="roll"
      @keydown.up.self.prevent="prevRoll"
      @keydown.down.self.prevent="nextRoll"
    >
    </v-text-field>
    <v-menu
      :close-on-content-click="false"
      :disabled="resultEmpty"
      offset-y
      transition="slide-y-transition"
    >
      <template #activator="{ on, attrs }">
        <v-btn
          fab
          depressed
          :loading="loading"
          color="secondary"
          id="dice-result-button"
          class="ml-4 title"
          v-on="on"
          v-bind="attrs"
        >
          {{ resultTotal }}
          <div
            class="dice-detector primary--text text--lighten-1"
            v-show="nat.length"
          >
            {{ nat }}
          </div>
        </v-btn>
      </template>

      <v-card width="250">
        <v-list dense>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-subtitle>
                {{ inputRepresentation }}
              </v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-icon v-if="diceParams.isModifiedRoll()">
              <v-chip small color="accent" v-if="diceParams.advantage"
                >adv</v-chip
              >
              <v-chip small color="accent" v-else>d/adv</v-chip>
            </v-list-item-icon>
          </v-list-item>
        </v-list>

        <v-divider></v-divider>

        <v-list>
          <!-- eslint-disable-next-line vue/valid-v-for -->
          <template v-for="(roll, i) in rolls">
            <!-- eslint-disable-next-line vue/valid-v-for -->
            <v-divider v-if="i === 1"></v-divider>
            <!-- eslint-disable-next-line vue/valid-v-for -->
            <v-list-item>
              <v-list-item-content>
                <v-list-item-subtitle class="list-unflexed">
                  <!-- eslint-disable-next-line vue/valid-v-for -->
                  <template v-for="el in rollRepresentation(roll)">
                    <span small class="chip-die" v-if="el.isDie">{{
                      el.str
                    }}</span>
                    <span v-else>{{ el.str }}</span>
                  </template>
                  <span
                    >= <b>{{ rollTotal(roll) }}</b></span
                  >
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </template>
        </v-list>
      </v-card>
    </v-menu>

    <v-snackbar v-model="error" top centered>{{ errorMsg }}</v-snackbar>
  </div>
</template>

<script>
import Parser from '../parser';
import { createNamespacedHelpers } from 'vuex';

const { mapGetters, mapActions } = createNamespacedHelpers('diceRoller');

export default {
  data() {
    return {
      loading: false,
      error: false,
      errorMsg: '',
      parser: Parser
    };
  },
  computed: {
    dice: {
      get() {
        return this.$store.getters['diceRoller/input'];
      },
      set(value) {
        this.$store.commit('diceRoller/SET_TEXT', value);
      }
    },
    keymap () {
      return {
        d: this.activate,
      }
    },
    ...mapGetters([
      'resultEmpty',
      'resultTotal',
      'diceParams',
      'inputRepresentation',
      'rollRepresentation',
      'rollTotal',
      'rolls',
      'nat'
    ])
  },
  methods: {
    async roll() {
      if (this.loading) return;
      if (!this.dice.length) return;
      let diceParams;
      const str = this.dice;

      this.loading = true;

      try {
        diceParams = this.parser.parse(str);
      } catch (e) {
        this.error = true;
        this.errorMsg = e.message;
        return;
      }

      try {
        await this.$store.dispatch('diceRoller/roll', diceParams);
      } catch (e) {
        this.error = true;
        this.errorMsg = e.message ? e.message : 'Roll failed';
      } finally {
        this.loading = false;
      }
    },
    activate (e) {
      e.preventDefault();
      const input = document.getElementById('dice-roller-input');
      input.focus();
    },
    ...mapActions(['prevRoll', 'nextRoll'])
  }
};
</script>

<style lang="scss">
#dice-result-button {
  position: relative;
}
.dice-detector {
  position: absolute;
  bottom: -11px;
  left: 0;
  right: 0;
  font-weight: bold;
  text-align: center;
  font-size: 10px;
}
.list-unflexed {
  white-space: unset !important;
  -webkit-line-clamp: unset !important;
}
.list-unflexed > span {
  margin-right: 4px;
  line-height: 28px;
}
.chip-die {
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 8px;
}
</style>
