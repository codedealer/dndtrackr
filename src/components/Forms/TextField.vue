<template>
  <v-text-field
    hide-details
    dense
    v-model="p"
    :placeholder="placeholder"
    class="actor-text-field"
    @focus="$emit('focus')"
  >
    <template v-slot:prepend>
      <strong v-if="label && label.length">{{ label }} </strong>
    </template>
  </v-text-field>
</template>

<script>
export default {
  props: ['property', 'index', 'label', 'placeholder'],
  data: () => ({}),

  computed: {
    p: {
      get () { return this.$store.state.encounter.actors[this.index].data[this.property]; },
      set (value) {
        this.$store.commit('encounter/UPDATE_DATA', { index: this.index, [this.property]: value });
      }
    },
  },
}
</script>

<style lang="scss">
.v-text-field.actor-text-field {
  > .v-input__control > .v-input__slot:before {
    border-color: transparent;
  }
  > .v-input__prepend-outer {
    line-height: 17px;
  }
}
</style>