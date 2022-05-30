<template>
  <div class="actor-block" v-show="showBlock">
    <slot></slot>

    <ArrayTextArea
      v-for="(el, i) in p"
      :index="index"
      :i="i"
      :el="el"
      :propertyName="property"
      :editOverride="editOverride"
      :key="el.key"
    />

    <v-card class="actor-block-actions" v-show="editOverride">
      <v-row>
        <v-col>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <span v-on="on">
                <v-btn
                  icon
                  v-bind="attrs"
                  @click="addChild"
                >
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </span>
            </template>
            <span>Toggle edit mode</span>
          </v-tooltip>
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>

<script>
import ArrayTextArea from './ArrayTextArea';
import { createNamespacedHelpers } from 'vuex';
const { mapMutations } = createNamespacedHelpers('encounter');

export default {
  props: ['property', 'index', 'editOverride'],

  computed: {
    p: {
      get () {
        const a = this.$store.state.encounter.actors[this.index].data[this.property];
        a.forEach(o => { o.key = o.key ? o.key : Math.random() });
        return a;
      }
    },
    showBlock () {
      return this.editOverride || this.p.length;
    },
  },

  methods: {
    ...mapMutations({
      pushData: 'PUSH_DATA_ARRAY',
    }),
    addChild () {
      this.pushData({
        index: this.index,
        propertyName: this.property,
        attack_bonus: 0,
        desc: '',
        name: '',
      });
    }
  },

  components: {
    ArrayTextArea,
  }
}
</script>