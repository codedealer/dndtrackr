<template>
  <div class="composite-field-wrapper" v-click-outside="stopEdit">
    <div class="composite-label-wrapper" v-show="showLabel">
      <v-btn
        text
        block
        class="actor-label-btn"
        @click="startEdit()"
      ><strong v-if="prepend">{{ prepend }}</strong>{{ label }}</v-btn>
    </div>
    <div class="composite-input-wrapper" v-show="!showLabel">
      <strong class="composite-prepend" v-if="prepend">{{ prepend }}</strong>
      <SpellTextField
        v-for="(placeholder, property) in propertyMap"
        :key="property"
        inline
        :property="property"
        :placeholder="placeholder"
        :editOverride="editOverride || edit"
      />
      <strong class="composite-append" v-if="append">{{ append }}</strong>
    </div>
  </div>
</template>

<script>
import SpellTextField from './SpellTextField';

export default {
  props: ['propertyMap', 'label', 'prepend', 'append', 'editOverride'],

  data: () => ({
    edit: false,
  }),

  computed: {
    showLabel () {
      return !this.edit && !this.editOverride && !!this.label;
    },
  },

  methods: {
    startEdit () {
      this.edit = true;
    },
    stopEdit () {
      this.edit = false;
    },
  },

  components: {
    SpellTextField,
  }
}
</script>

<style lang="scss">
.composite-field-wrapper {
  display: flex;
  .v-btn > .v-btn__content {
    letter-spacing: normal;
    font-size: 16px;
  }
}
.composite-input-wrapper {
  display: flex;
  align-items: flex-end;
  .composite-prepend {
    margin-right: 10px;
    flex: 1 1 auto;
  }
  .composite-append {
    flex: 1 1 auto;
    margin-left: 10px;
  }
}
.composite-label-wrapper {
  margin-right: 10px;
  .v-btn.actor-label-btn {
    text-transform: none;
    padding-left: 0px;
    padding-right: 2px;
    strong {
      margin-right: 10px;
    }
  }
}
</style>