<template>
  <div class="actor-textarea-wrapper" v-show="showControl" v-click-outside="stopEdit">
    <div class="textarea-label-wrapper" v-show="!edit">
      <v-btn
        text
        small
        class="actor-label-text-btn"
        @click="startEdit()"
        v-if="label"
      >{{ label }}</v-btn><template v-if="markdown === undefined">{{ p }}</template>
      <vue-markdown v-else class="markdown-area" :source="p"></vue-markdown>
    </div>
    <div class="textarea-input-wrapper" v-show="edit">
      <v-textarea
        filled
        :label="label"
        :placeholder="placeholder"
        :class="addClass"
        auto-grow
        rows="1"
        v-model="p"
        @focus="e = true"
        v-if="inline === undefined"
      ></v-textarea>
      <v-text-field
        v-else
        hide-details
        dense
        v-model="p"
        :class="addClass"
        :placeholder="placeholder"
        autocomplete="off"
        class="actor-text-field"
        @focus="e = true"
      >
        <template v-slot:prepend>
          <strong v-if="label">{{ label }} </strong>
        </template>
      </v-text-field>
    </div>
  </div>
</template>

<script>
import VueMarkdown from 'vue-markdown'
import { createNamespacedHelpers } from 'vuex';
const { mapMutations } = createNamespacedHelpers('spells');

export default {
  props: [
    'property',
    'label',
    'placeholder',
    'editOverride',
    'inline',
    'addClass',
    'markdown',
  ],

  data: () => ({
    e: false,
  }),

  computed: {
    p: {
      get () {
        return this.$store.state.spells.spell.data[this.property];
      },
      set (value) {
        this.updateData({ [this.property]: value });
      }
    },
    edit () {
      return this.editOverride || this.e;
    },
    showControl () {
      return this.p || this.edit;
    }
  },

  methods: {
    ...mapMutations({
      updateData: 'UPDATE_DATA',
    }),
    startEdit () {
      this.e = true;
    },
    stopEdit () {
      this.e = false;
    },
  },

  components: {
    VueMarkdown,
  }
}
</script>