<template>
  <v-card flat>
    <v-card-text>
      <v-row
        class="mx-0"
        v-show="edit"
      >
        <v-text-field
          dense
          v-model="tagModel"
          :placeholder="placeholder"
          :error-messages="errors"
          @keydown.enter = 'addTag'
        ></v-text-field>
      </v-row>
      <v-row
        class="mx-0"
      >
        <v-chip
          v-for="(c, i) in tags"
          class="mr-2"
          small
          :close="edit"
          @click:close="removeTag(i)"
        >{{ c }}</v-chip>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  props: ['edit', 'tags', 'placeholder'],

  data: () => ({
    tagModel: '',
    errors: [],
  }),

  methods: {
    addTag () {
      if (this.tagModel.length < 1) return;

      let newTags = this.tagModel.replace(' ', ',').split(',').map(c => c.trim());
      this.$emit('update', [...this.tags, ...newTags]);
      this.tagModel = '';
    },
    removeTag (index) {
      let tags = this.tags.slice();
      tags.splice(index, 1);
      this.$emit('update', tags);
    },
  },
}
</script>