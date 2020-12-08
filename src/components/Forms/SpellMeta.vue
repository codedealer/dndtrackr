<template>
  <v-card flat>
    <v-card-text>
      <v-row
        class="mx-0"
        v-show="edit"
      >
        <v-text-field
          dense
          v-model="classModel"
          placeholder="Class"
          :error-messages="errors"
          @keydown.enter = 'addClass'
        ></v-text-field>
      </v-row>
      <v-row
        class="mx-0"
        v-show="edit"
      >
        <v-chip
          v-for="(c, i) in spell.data.dnd_class"
          class="mr-2"
          small
          close
          @click:close="removeClass(i)"
        >{{ c }}</v-chip>
      </v-row>
      <v-row
        class="mx-0"
        v-show="!edit"
      >
        <v-chip
          v-for="c in spell.data.dnd_class"
          class="mr-2"
          small
        >{{ c }}</v-chip>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import { createNamespacedHelpers } from 'vuex';

const { mapState, mapMutations } = createNamespacedHelpers('spells');
export default {
  props: ['editOverride'],

  data: () => ({
    e: false,
    classModel: '',
    errors: [],
  }),

  computed: {
    ...mapState(['spell']),
    edit () { return this.e || this.editOverride },
  },

  methods: {
    ...mapMutations({
      updateData: 'UPDATE_DATA',
    }),
    addClass () {
      let newClasses = this.classModel.split(',').map(c => c.trim());
      let classes = [...this.spell.data.dnd_class, ...newClasses];

      this.updateData({ dnd_class: classes });
      this.classModel = '';
    },
    removeClass (index) {
      let classes = this.spell.data.dnd_class.split(index, 1);
      this.updateData({ dnd_class: classes });
    },
  },
}
</script>