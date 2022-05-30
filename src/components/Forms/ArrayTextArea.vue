<template>
  <div class="actor-textarea-wrapper" v-click-outside="stopEdit">
    <div class="textarea-label-wrapper" v-show="!edit">
      <v-btn
        text
        small
        class="actor-label-text-btn"
        @click="startEdit()"
      >{{ name }}</v-btn>
      <vue-markdown class="markdown-area" :source="desc"></vue-markdown>
    </div>
    <div class="textarea-input-wrapper" v-show="edit">
      <!--v-text-field
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
      </v-text-field-->
      <v-combobox
        hide-details
        auto-select-first
        dense
        v-model="name"
        placeholder="Name"
        @focus="e = true"
        :items="featList"
        :loading="loading"
        item-text="name"
        autocomplete="none"
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
        <template v-slot:append>
          <v-tooltip
            bottom
            v-if="$store.state.user.state"
          >
            <template v-slot:activator="{ on, attrs }">
              <span v-on="on">
                <v-btn
                  icon
                  v-bind="attrs"
                  x-small
                  color=""
                  @click="saveAsFeat"
                >
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </span>
            </template>
            Save as a feat
          </v-tooltip>
        </template>
      </v-combobox>
      <v-textarea
        filled
        auto-grow
        v-model="desc"
        @focus="e = true"
      ></v-textarea>
    </div>
  </div>
</template>

<script>
import VueMarkdown from 'vue-markdown'
import { createNamespacedHelpers } from 'vuex';
const { mapMutations } = createNamespacedHelpers('encounter');
const { mapGetters } = createNamespacedHelpers('data');

export default {
  props: ['index', 'propertyName', 'el', 'editOverride', 'i'],

  data: () => ({
    e: false,
    loading: false,
  }),

  computed: {
    edit () {
      return this.editOverride || this.e || !(this.name && this.desc);
    },
    name: {
      get () { return this.el.name },
      async set (value) {
        // value can either be a simple string or a feat object
        let name = value;
        if (value !== null && typeof value === 'object') {
          // fetch the feat
          this.loading = true;
          name = value.name;

          try {
            await this.$store.dispatch('feats/loadFeat', value);

            this.updateData({
              index: this.index,
              propertyName: this.propertyName,
              i: this.i,
              desc: this.$store.state.feats.feat.content,
            });
          } catch (e) {
            console.error(e);
            this.$store.dispatch('server/error', e.message || e);
          }

          this.loading = false;
        }
        this.updateData({
          index: this.index,
          propertyName: this.propertyName,
          i: this.i,
          name,
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
    ...mapGetters({
      featList: 'featIndex',
    }),
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
    saveAsFeat () {
      this.$store.commit('feats/SET_FEAT', false);
      this.$store.commit('feats/SET_NAME', this.el.name);
      this.$store.commit('feats/SET_CONTENT', this.el.desc);
      this.$store.commit('feats/TOGGLE_DIALOG', true);
    },
  },

  components: {
    VueMarkdown,
  }
}
</script>
