<template>
  <v-menu
    :close-on-content-click="false"
    offset-y
    v-model="menuState"
  >
    <template v-slot:activator="{ on: menu, attrs }">
      <v-tooltip bottom>
        <template v-slot:activator="{ on: tooltip }">
          <slot v-bind="{ menu, tooltip, attrs }"></slot>
        </template>
        <span>{{ tooltipMsg }}</span>
      </v-tooltip>
    </template>
    <v-card>
      <v-list>
        <v-list-item>
          <v-list-item-content>
             <v-text-field
                label="Status"
                autofocus
                dense
                hide-details
                outlined
                class="actor-status-name"
                v-model.trim="name"
                @keydown.enter="status ? edit() : create()"
              >
                <template v-slot:prepend>
                  <v-select
                    dense
                    label="Icon"
                    hide-details
                    outlined
                    clearable
                    class="status-icon-selector"
                    :items="availableIcons"
                    v-model="statusIcon"
                  >
                    <template v-slot:item="{ item, index }">
                      <v-icon>{{ item.value }}</v-icon>
                    </template>
                    <template v-slot:selection="{ item, index }">
                      <v-icon>{{ item.value }}</v-icon>
                    </template>
                  </v-select>
                </template>
              </v-text-field>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <v-divider></v-divider>

      <v-list>
        <v-list-item>
          <v-list-item-action>
            <v-switch color="primary" v-model="showInBar"></v-switch>
          </v-list-item-action>
          <v-list-item-title>Show in status bar</v-list-item-title>
        </v-list-item>
        <v-list-item>
          <v-list-item-action>
            <v-switch color="primary" v-model="deletable"></v-switch>
          </v-list-item-action>
          <v-list-item-title>Allow deletion from status bar</v-list-item-title>
        </v-list-item>
      </v-list>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click.stop="reset">Cancel</v-btn>
        <v-btn
          v-if="status"
          text
          color="primary"
          :disabled="isEmpty"
          @click.stop="edit"
        >Save</v-btn>
        <v-btn
          v-else
          text
          color="primary"
          :disabled="isEmpty"
          @click.stop="create"
        >Create</v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script>
import Status from '../model/status';

export default {
  props: ['actor', 'index', 'showDelete', 'status', 'statusIndex'],

  mounted () {
    this.reset();
  },

  data: () => ({
    menuState: false,
    name: '',
    deletable: false,
    showInBar: true,
    availableIcons: [
      { value: 'mdi-shield', text: '' },
      { value: 'mdi-eye', text: '' },
    ],
    statusIcon: '',
  }),

  computed: {
    tooltipMsg () {
      return this.status === undefined ? 'Add status' : 'Edit';
    },
    isEmpty () {
      return !this.name.length && !this.statusIcon.length;
    },
  },

  methods: {
    reset () {
      this.name = this.status ? this.status.name : '';
      this.deletable = this.status ? this.status.deletable : (this.showDelete || false);
      this.showInBar = this.status ? this.status.showInBar : true;
      this.statusIcon = this.status ? this.status.icon : '';
      this.menuState = false;
    },
    edit () {
      if (!this.status) {
        this.reset();
        return;
      }

      const status = new Status({
        name: this.name,
        showInBar: this.showInBar,
        deletable: this.deletable,
        icon: this.statusIcon,
      });

      this.$store.commit('encounter/EDIT_STATUS', { actorIndex: this.index, status, statusIndex: this.statusIndex });

      this.reset();
    },
    create () {
      const status = new Status({
        name: this.name,
        showInBar: this.showInBar,
        deletable: this.deletable,
        icon: this.statusIcon,
      });
      this.$store.commit('encounter/ADD_STATUS', { index: this.index, status });

      this.reset();
    }
  }
}
</script>