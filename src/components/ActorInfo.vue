<template>
<div class="actor-info-content">
  <v-card>
    <v-row>
      <v-col>
        <StatusButton
          :actor="actor"
          :index="index"
          :showDelete="false"
          v-slot="{ attrs, tooltip, menu }"
        >
          <v-btn
            color="secondary"
            class="ml-2 mb-2"
            x-small
            fab
            depressed
            v-bind="attrs"
            v-on="{ ...tooltip, ...menu }"
          ><v-icon>mdi-plus</v-icon></v-btn>
        </StatusButton>

        <StatusButton
          v-for="(status, i) in actor.status"
          :key="status.uid"
          :actor="actor"
          :index="index"
          :statusIndex="i"
          :status="status"
          v-slot="{ attrs, tooltip, menu }"
        >
          <v-chip
            close
            @click:close="deleteStatus(i)"
            class="px-1 ml-2 mb-2 panel-status-pill"
            style="cursor: pointer;"
            label
            filter
            :input-value="status.icon.length > 0"
            :filter-icon="status.icon"
            v-bind="attrs"
            v-on="{ ...tooltip, ...menu }"
          >{{ status.name }}</v-chip>
        </StatusButton>
      </v-col>
      <v-col cols="auto">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <span v-on="on">
              <v-btn
                icon
                v-bind="attrs"
                :color="editColor"
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
                :disabled="!blockControls && !saveState.canSave"
                :color="saveCloudColor"
                v-bind="attrs"
                @click="saveActorToCloud"
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
                :disabled="!blockControls && !saveState.canFork"
                v-bind="attrs"
                @click="forkActor"
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
                <v-list-item-action>
                  <v-switch color="primary" v-model="setWidget"></v-switch>
                </v-list-item-action>
                <v-list-item-title>Show Hitpoints Widget</v-list-item-title>
              </v-list-item>
              <v-list-item>
                <v-list-item-action>
                  <v-switch color="primary" v-model="setNotes"></v-switch>
                </v-list-item-action>
                <v-list-item-title>Collapse Notes</v-list-item-title>
              </v-list-item>
              <v-list-item>
                <v-list-item-action>
                  <v-switch color="primary" v-model="setAttributes"></v-switch>
                </v-list-item-action>
                <v-list-item-title>Show Attributes</v-list-item-title>
              </v-list-item>
            </v-list>

            <v-divider></v-divider>

            <v-list>
              <v-list-item>
                <v-list-item-content>
                  <v-btn
                    :disabled="!blockControls && !saveState.canDelete"
                    color="error"
                    @click="removeFromCloud"
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
  </v-card>

  <ActorForm :actor="actor" :index="index" :editMode="editMode" />

</div>
</template>

<script>
import status from '../utils/statusMixin';
import SaveState from '../model/saveState';
import StatusButton from './StatusButton';
import ActorForm from './ActorForm';

export default {
  mixins: [status],
  props: ['actor', 'index'],
  data: () => ({
    editMode: false,
    blockControls: false,
  }),

  computed: {
    isLoggedIn () {
      return this.$store.state.user.state;
    },
    isSynced () {
      return this.actor.settings.dirty === false;
    },
    isOwned () {
      if (!this.actor.key) return false;
      return this.$store.state.data._userMonsterIndex.some(a => a.key === this.actor.key);
    },
    saveState () {
      const state = new SaveState();
      state.icon = 'mdi-harddisk';

      if (!this.actor.key) {
        // new local actor
        state.text = 'Saved locally. Press to save to cloud (account sign in required).';
        state.canSave = this.isLoggedIn;
        state.canFork = false;
        state.canDelete = false;
      } else if (this.isLoggedIn && this.isOwned) {
        // actor belongs to the user
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
        // 3rd party actor
        state.text = 'You don\'t have permission to save. Changes will be saved locally.';
        state.icon = 'mdi-cloud-off-outline';
        state.canSave = false;
        state.canDelete = false;
        state.canFork = this.isLoggedIn;
      }
      return state;
    },
    editColor () { return this.editMode ? 'primary' : '' },
    saveCloudColor () {
      if (!this.isOwned) return '';
      return this.saveState.canSave && this.isSynced ? '' : 'primary';
    },
    setWidget: {
      get () { return this.actor.settings.showHitPointWidget },
      set (value) {
        this.$store.commit('encounter/UPDATE_SETTINGS', {
          index: this.index,
          showHitPointWidget: value,
        });
      }
    },
    setNotes: {
      get () { return this.actor.settings.collapseNotes },
      set (value) {
        this.$store.commit('encounter/UPDATE_SETTINGS', {
          index: this.index,
          collapseNotes: value,
        });
      }
    },
    setAttributes: {
      get () { return this.actor.settings.showAttributes },
      set (value) {
        this.$store.commit('encounter/UPDATE_SETTINGS', {
          index: this.index,
          showAttributes: value,
        });
      }
    },
  },

  methods: {
    async saveActorToCloud () {
      this.blockControls = true;
      await this.$store.dispatch('server/saveActor', {
        index: this.index,
        actor: this.actor,
      });
      this.blockControls = false;
    },
    async removeFromCloud () {
      this.blockControls = true;
      await this.$store.dispatch('server/removeActor', {
        index: this.index,
        actor: this.actor,
      });
      this.blockControls = false;
    },
    async forkActor () {
      this.blockControls = true;
      await this.$store.dispatch('server/forkActor', {
        index: this.index,
        actor: this.actor,
      });
      this.blockControls = false;
    },
  },

  components: {
    StatusButton,
    ActorForm,
  }
}
</script>

<style lang="scss">
.panel-status-pill {
  .v-icon.v-chip__filter {
    margin-left: -2px;
    margin-right: 3px;
    font-size: 18px;
  }
}
</style>