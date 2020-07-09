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
          :key="status.icon + status.name"
          :actor="actor"
          :index="index"
          :statusIndex="i"
          :status="status"
          v-slot="{ attrs, tooltip, menu }"
        >
          <v-chip
            close
            @click:close="deleteStatus(i)"
            class="px-1 ml-2 mb-2"
            style="cursor: pointer;"
            label
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
                :disabled="saveState.disabled"
                v-bind="attrs"
              >
                <v-icon>{{ saveState.icon }}</v-icon>
              </v-btn>
            </span>
          </template>
          <span>{{ saveState.text }}</span>
        </v-tooltip>

      </v-col>
    </v-row>
  </v-card>
  <h1>{{actor.name}}</h1>
</div>
</template>

<script>
import status from '../utils/statusMixin';
import StatusButton from './StatusButton';

export default {
  mixins: [status],
  props: ['actor', 'index'],
  data: () => ({}),

  computed: {
    isLoggedIn () {
      return this.$store.state.user.state;
    },
    saveState () {
      let text;
      let icon = 'mdi-harddisk';

      if (!this.actor.key) {
        text = 'Saved locally. Press to save to cloud (account sign in required).';
      } else if (this.isLoggedIn && this.actor.tag === this.$store.state.user.uid) {
        text = 'Saved in the cloud. Edits will be synced';
        icon = 'mdi-cloud-check-outline';
      } else {
        text = 'You don\'t have permission to edit. Changes will be saved locally.';
        icon = 'mdi-cloud-outline';
      }
      return {
        disabled: true,
        icon,
        text,
      }
    },
  },

  components: {
    StatusButton,
  }
}
</script>