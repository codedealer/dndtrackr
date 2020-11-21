<template>
  <div class="actor-textarea-wrapper" v-click-outside="stopEdit">
    <div class="textarea-label-wrapper" v-show="!edit">
      <v-btn
        text
        small
        class="actor-label-text-btn"
        @click="startEdit()"
      >{{ name }}</v-btn>
      {{ desc }}
    </div>
    <div class="textarea-input-wrapper" v-show="edit">
      <v-text-field
        hide-details
        dense
        v-model="name"
        placeholder="Name"
        class="actor-text-field"
        @focus="e = true"
      >
        <template v-slot:prepend>
          <v-tooltip
            bottom
          >
            <template v-slot:activator="{ on, attrs }">
              <span v-on="on">
                <v-btn
                  icon
                  v-bind="attrs"
                  x-small
                  color="error"
                  @click="removeItem({ index, propertyName, i })"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </span>
            </template>
            Delete item
          </v-tooltip>
        </template>
      </v-text-field>
      <v-textarea
        filled
        auto-grow
        rows="1"
        v-model="desc"
        @focus="e = true"
      ></v-textarea>
    </div>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex';
const { mapMutations } = createNamespacedHelpers('encounter');

export default {
  props: ['index', 'propertyName', 'el', 'editOverride', 'i'],

  data: () => ({
    e: false,
  }),

  computed: {
    edit () {
      return this.editOverride || this.e || !(this.name && this.desc);
    },
    name: {
      get () { return this.el.name },
      set (value) {
        this.updateData({
          index: this.index,
          propertyName: this.propertyName,
          i: this.i,
          name: value
        });
      }
    },
    desc: {
      get () { return this.el.desc },
      set (value) {
        this.updateData({
          index: this.index,
          propertyName: this.propertyName,
          i: this.i,
          desc: value
        });
      }
    },
  },

  methods: {
    ...mapMutations({
      updateData: 'UPDATE_DATA_ARRAY',
      removeItem: 'REMOVE_DATA_ARRAY',
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
