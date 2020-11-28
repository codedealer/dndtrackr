<template>
  <div class="actor-textarea-wrapper" v-show="showControl" v-click-outside="stopEdit">
    <div class="textarea-label-wrapper" v-show="!edit">
      <v-btn
        text
        small
        class="actor-label-text-btn"
        @click="startEdit()"
        v-if="label"
      >{{ label }}</v-btn>{{ p }}
    </div>
    <div class="textarea-input-wrapper" v-show="edit">
      <v-textarea
        filled
        :label="label"
        auto-grow
        rows="1"
        v-model="p"
        @focus="e = true"
      ></v-textarea>
    </div>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex';
const { mapMutations } = createNamespacedHelpers('encounter');
export default {
  props: ['property', 'index', 'label', 'editOverride'],

  data: () => ({
    e: false,
  }),

  computed: {
    p: {
      get () {
        return this.$store.state.encounter.actors[this.index].data[this.property];
      },
      set (value) {
        this.updateData({ index: this.index, [this.property]: value });
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
}
</script>

<style lang="scss">
</style>