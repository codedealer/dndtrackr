<template>
  <div>
    <v-card class="sticky-card">
      <v-overlay
        absolute
        :value="loading"
      >
        <v-progress-circular indeterminate size="40"></v-progress-circular>
      </v-overlay>
      <v-container fluid class="py-0">
        <v-row>
          <v-col cols="auto">
            <Autocomplete
              :list="index"
              defaultInput
              placeholder="Find spell"
              v-model="spellModel"
              v-slot="{ item }"
              @choice="onChoice"
            >
              <div class="autocomplete-item-title">{{ item.name }}</div>
              <div class="autocomplete-item-subtitle">
                <v-chip x-small class="mr-1" color="purple darken-4">lvl {{ item.level }}</v-chip>
                <v-chip x-small class="mr-1" color="red darken-3" v-if="strToBool(item.concentration)">con.</v-chip>
                <v-chip x-small class="mr-1" color="orange darken-3" v-if="strToBool(item.ritual)">ritual</v-chip>
                <v-chip x-small :color="sourceIconColor(item.tag)">{{ sourceIcon(item.tag) }}</v-chip>
              </div>
            </Autocomplete>
          </v-col>
          <v-spacer></v-spacer>
          <v-col cols="auto">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <span v-on="on">
                  <v-btn
                    icon
                    :disabled="loading || !isLoggedIn"
                    v-bind="attrs"
                    @click="addNewSpell()"
                  >
                    <v-icon>mdi-plus</v-icon>
                  </v-btn>
                </span>
              </template>
              <span>Add new spell</span>
            </v-tooltip>

            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <span v-on="on">
                  <v-btn
                    icon
                    v-bind="attrs"
                    :color="editColor"
                    :disabled="!canEdit"
                    @click="editMode = !editMode"
                  >
                    <v-icon>mdi-pen</v-icon>
                  </v-btn>
                </span>
              </template>
              <span>Toggle edit mode</span>
            </v-tooltip>

            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <span v-on="on">
                  <v-btn
                    icon
                    :disabled="!saveState.canSave"
                    :color="saveCloudColor"
                    v-bind="attrs"
                    @click="saveSpellToCloud"
                  >
                    <v-icon>{{ saveState.icon }}</v-icon>
                  </v-btn>
                </span>
              </template>
              <span>{{ saveState.text }}</span>
            </v-tooltip>

            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <span v-on="on">
                  <v-btn
                    icon
                    :disabled="loading || !saveState.canFork"
                    v-bind="attrs"
                    @click="forkSpell"
                  >
                    <v-icon>mdi-source-branch</v-icon>
                  </v-btn>
                </span>
              </template>
              <span>Fork: save a copy to the cloud</span>
            </v-tooltip>

            <v-menu
              offset-y
              :close-on-content-click="false"
              transition="slide-y-transition"
            >
              <template #activator="{ on, attrs }">
                 <v-btn
                    icon
                    v-bind="attrs"
                    v-on="on"
                  >
                    <v-icon>mdi-cog</v-icon>
                  </v-btn>
              </template>

              <v-card>
                <v-list>
                  <v-list-item>
                    <v-list-item-content>
                      <v-btn
                        :disabled="!saveState.canDelete"
                        color="error"
                        @click="removeSpell"
                      >
                        Remove from cloud
                      </v-btn>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-menu>
          </v-col>
        </v-row>
      </v-container>
    </v-card>

    <SpellForm v-if="spell" :spell="spell" :editMode="editMode" />

  </div>
</template>

<script>
import SaveState from '../model/saveState';
import Autocomplete from './Autocomplete';
import SpellForm from './SpellForm';
import strToBool from '../utils/strToBool';
import { createNamespacedHelpers } from 'vuex';

const { mapState, mapMutations, mapActions } = createNamespacedHelpers('spells');

export default {
  name: 'SpellInfo',

  data: () => ({
    spellModel: '',
    loading: false,
    editMode: false,
  }),

  computed: {
    ...mapState(['spell']),
    index () { return this.$store.getters['data/spellIndex']; },
    editColor () { return this.editMode ? 'primary' : '' },
    canEdit () {
      return this.spell && (this.isOwned || !this.spell.key) && !this.loading
    },
    isLoggedIn () {
      return this.$store.state.user.state;
    },
    isSynced () {
      return this.spell && this.spell.settings.dirty === false;
    },
    isOwned () {
      if (!this.spell.key) return false;
      return this.$store.state.data._userSpellIndex.some(a => a.key === this.spell.key);
    },
    saveCloudColor () {
      if (!this.isOwned) return '';
      return this.saveState.canSave && this.isSynced ? '' : 'primary';
    },
    saveState () {
      const state = new SaveState();
      state.icon = 'mdi-cloud-off-outline';

      if (!this.spell) {
        state.canSave = false;
        state.canDelete = false;
        state.canFork = false;
        state.text = 'Add new spell to save';
        return state;
      }

      if (!this.spell.key) {
        // new local spell
        state.text = 'Not saved.';
        if (!this.isLoggedIn) state.text += ' (account sign in required)';
        state.canSave = this.isLoggedIn;
        state.canDelete = false;
        state.canFork = false;
      } else if (this.isLoggedIn && this.isOwned) {
        // spell belongs to the user
        state.canSave = true;
        state.canFork = true;
        state.canDelete = true;
        if (this.isSynced) {
          state.text = 'Saved in the cloud.';
          state.icon = 'mdi-cloud-check-outline';
        } else {
          state.text = 'Has unsynced local changes';
          state.icon = 'mdi-cloud';
        }
      } else {
        // 3rd party spell
        state.text = 'You don\'t have permission to save changes.';
        state.icon = 'mdi-cloud-off-outline';
        state.canSave = false;
        state.canDelete = false;
        state.canFork = this.isLoggedIn;
      }
      return state;
    },
  },

  methods: {
    ...mapMutations({
      addSpell: 'SET_SPELL',
    }),
    addNewSpell () {
      this.addSpell();
      this.editMode = true;
    },
    sourceIcon (tag) {
      return tag === 'srd' ? tag : 'self';
    },
    sourceIconColor (tag) { return tag !== 'srd' ? 'indigo darken-4' : '' },
    async onChoice (item) {
      if (this.loading) return;
      this.editMode = false;
      this.loading = true;

      await this.$store.dispatch('server/getSpell', item);

      this.loading = false;
      this.spellModel = '';
    },
    strToBool,
    async saveSpellToCloud () {
      if (this.loading) return;
      this.loading = true;

      await this.$store.dispatch('server/saveSpell', this.spell);

      this.loading = false;
      this.editMode = false;
    },
    async removeSpell () {
      if (this.loading) return;
      this.loading = true;

      await this.$store.dispatch('server/removeSpell', this.spell);

      this.loading = false;
      this.editMode = false;
    },
    async forkSpell () {
      if (this.loading) return;
      this.loading = true;

      await this.$store.dispatch('server/forkSpell', this.spell);

      this.loading = false;
      this.editMode = false;
    }
  },

  components: {
    Autocomplete,
    SpellForm,
  }
}
</script>

<style lang="scss">
.sticky-card {
  position: sticky;
  top: -12px;
  z-index: 2;
}
</style>