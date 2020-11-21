<template>
  <div class="attribute-wrapper">
    <div class="attribute">
      <v-text-field
        :label="attrLabel"
        hide-details
        outlined
        dense
        v-model="p"
        class="attribute-main-field"
      >
        <template v-slot:append>
          <div class="actor-mod-panel">{{ mod }}</div>
        </template>
      </v-text-field>
    </div>
    <div class="saving-throw">
      <v-text-field
        hide-details
        dense
        v-model="s"
        class="text-subtitle-2"
      >
        <template v-slot:prepend>
          <v-icon small>mdi-shield-outline</v-icon>
        </template>
      </v-text-field>
    </div>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex';
import statUtils from '../../utils/statUtils';
const { mapMutations } = createNamespacedHelpers('encounter');

export default {
  props: ['index', 'actor', 'attributeName', 'attribute'],

  computed: {
    p: {
      get () { return this.attribute },
      set (value) {
        this.updateData({
          index: this.index,
          attributes: {
            [this.attributeName]: value,
          }
        })
      }
    },
    s: {
      get () {
        let save = Object.prototype.hasOwnProperty.call(this.actor.data.saves, `${this.attributeName}_save`) ? this.actor.data.saves[`${this.attributeName}_save`] : this.mod;

        return statUtils.fixMod(save);
      },
      set (value) {
        this.updateData({
          index: this.index,
          saves: {
            [`${this.attributeName}_save`]: value
          }
        });
      },
    },
    attrLabel () {
      return statUtils.shortAttribute(this.attributeName);
    },
    mod () {
      const m = statUtils.getModifier(this.attribute);
      return m > 0 ? `+${m}` : m;
    },
  },

  methods: {
    ...mapMutations({
      updateData: 'UPDATE_DATA',
    }),
  }
}
</script>

<style lang="scss">
.attribute {
  margin: 10px 8px;
  .attribute-main-field {
    width: 70px;
  }
  .v-text-field.v-text-field--enclosed:not(.v-text-field--rounded) > .v-input__control > .v-input__slot {
    padding-right: 0;
    .v-input__append-inner {
      align-self: stretch;
      margin-top: 0;
      padding-left: 0;
      display: flex;
      align-items: center;
      background-color: #323232;
    }
  }
}
.actor-mod-panel {
  width: 26px;
  text-align: center;
}
.saving-throw {
  margin: 0 8px;
  .v-input > .v-input__control > .v-input__slot:before {
    border-color: transparent;
  }
}
</style>