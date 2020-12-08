<template>
  <v-menu
    :close-on-content-click="false"
    offset-y
    v-model="menuState"
    v-hotkey.stop="keymap"
  >
    <template v-slot:activator="{ on: menu, attrs }">
      <v-tooltip bottom>
        <template v-slot:activator="{ on: tooltip }">
          <v-btn
            height="32"
            width="38"
            min-width="32"
            tile
            depressed
            transition="slide-x-transition"
            color="secondary lighten-2"
            :loading="loading"
            v-bind="attrs"
            v-on="{ ...tooltip, ...menu }"
          >{{ actor.data.hit_points }}</v-btn>
        </template>
        <span>Hitpoints</span>
      </v-tooltip>
    </template>
    <v-card>
      <v-list>
        <v-list-item>
          <v-list-item-content>
             <v-text-field
                label="Damage"
                autofocus
                dense
                hide-details
                outlined
                v-model.trim="damage"
                append-icon="mdi-sword"
                @click:append="submit"
                @keydown.enter="submit"
              ></v-text-field>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <v-divider></v-divider>

      <v-list>
        <v-list-item>
          <v-list-item-action>
            <v-switch color="primary" v-model="widgetState"></v-switch>
          </v-list-item-action>
          <v-list-item-title>Show widget</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>
</template>

<script>
import { createNamespacedHelpers } from 'vuex';

const { mapMutations } = createNamespacedHelpers('encounter');

export default {
  props: ['actor', 'index', 'loading'],
  data: () => ({
    menuState: false,
    damage: '',
  }),

  computed: {
    widgetState: {
      get () { return this.actor.settings.showHitPointWidget },
      set (value) {
        this.UPDATE_SETTINGS({ index: this.index, showHitPointWidget: value });
      }
    },
    keymap () {
      return {
        q: this.hotKeyShow,
      }
    },
  },

  methods: {
    ...mapMutations([
      'UPDATE_SETTINGS',
      'UPDATE_DATA',
    ]),
    submit () {
      let value = this.damage.replace('+', '-');
      value = parseInt(value);
      if (isNaN(value)) {
        this.damage = 'error';
        return;
      }

      let newHitpoints = this.actor.data.hit_points - value;
      if (isNaN(newHitpoints)) {
        this.damage = 'error';
        newHitpoints = 0;
      } else {
        this.damage = '';
        this.menuState = false;
      }

      this.UPDATE_DATA({ index: this.index, hit_points: newHitpoints });
    },
    hotKeyShow () {
      if (this.loading) return;
      if (this.actor.uid !== this.$store.state.encounter.selected) return;
      this.menuState = true;
    },
  }
}
</script>