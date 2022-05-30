<template>
  <v-dialog
    v-model="dialog"
    max-width="90vh"
  >
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        icon
        v-bind="attrs"
        v-on="on"
        @click="resetForm"
      >
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </template>
  <v-card>
    <v-card-title>
      <span class="text-h5">Feat</span>
    </v-card-title>
    <v-card-text>
      <v-text-field
        placeholder="Name"
        autocomplete="none"
        dense
        v-model="featName"
      ></v-text-field>

      <v-textarea
        filled
        auto-grow
        v-model="featContent"
      ></v-textarea>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn
        color="primary"
        text
        @click="resetForm"
      >
        Close
      </v-btn>
      <v-btn
        color="primary"
        @click="save"
      >
        Save
      </v-btn>
    </v-card-actions>
  </v-card>
  </v-dialog>
</template>

<script>
import { createNamespacedHelpers } from 'vuex';
const { mapState, mapMutations, mapActions } = createNamespacedHelpers('feats');
export default {
  data: () => ({}),

  computed: {
    ...mapState(['_dialog', '_featContent', '_featName']),
    dialog: {
      get () { return this._dialog; },
      set (value) { this.toggleDialog(value); }
    },
    featContent: {
      get () { return this._featContent },
      set (value) { this.updateContent(value) }
    },
    featName: {
      get () { return this._featName },
      set (value) { this.updateName(value) }
    },
  },

  methods: {
    ...mapMutations({
      toggleDialog: 'TOGGLE_DIALOG',
      updateContent: 'SET_CONTENT',
      updateName: 'SET_NAME',
      resetForm: 'RESET_FORM',
    }),
    ...mapActions(['save']),
  }
}
</script>