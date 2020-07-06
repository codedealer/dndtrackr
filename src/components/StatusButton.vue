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
                v-model.trim="name"
                @keydown.enter="status ? edit() : create()"
              ></v-text-field>
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
        <v-btn v-if="status" text color="primary" @click.stop="edit">Save</v-btn>
        <v-btn v-else text color="primary" @click.stop="create">Create</v-btn>
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

  data () {
    return {
      menuState: false,
      name: '',
      deletable: false,
      showInBar: true,
    }
  },

  computed: {
    tooltipMsg () {
      return this.status === undefined ? 'Add status' : 'Edit';
    },
  },

  methods: {
    reset () {
      this.name = this.status ? this.status.name : '';
      this.deletable = this.status ? this.status.deletable : (this.showDelete || false);
      this.showInBar = this.status ? this.status.showInBar : true;
      this.menuState = false;
    },
    edit () {
      if (!this.status) {
        this.reset();
        return;
      }

      const status = new Status({ name: this.name, showInBar: this.showInBar, deletable: this.deletable });

      this.$store.commit('encounter/EDIT_STATUS', { actorIndex: this.index, status, statusIndex: this.statusIndex });

      this.reset();
    },
    create () {
      if (!this.name.length) return false;

      const status = new Status({ name: this.name, showInBar: this.showInBar, deletable: this.deletable });
      this.$store.commit('encounter/ADD_STATUS', { index: this.index, status });

      this.reset();
    }
  }
}
</script>