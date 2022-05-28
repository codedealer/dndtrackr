<template>
  <div class="actor-form-container">
    <h1 class="spell-header">
      <v-text-field
        placeholder="Spell name"
        dense
        :messages="nameCollisionMsg"
        v-model="name"
        height="46"
        class="actor-form-name"
      ></v-text-field>
    </h1>
    <div class="actor-subheader">
      <CompositeSpellTextField
        :propertyMap="headerComposite"
        :label="headerLabel"
        :editOverride="editMode"
      />
    </div>
    <div class="spells-special-wrapper" v-show="(ritual || concentration) || editMode">
      <v-chip
        class="mr-2"
        :input-value="editMode"
        filter
        small
        color="orange darken-2"
        :filter-icon="ritual ? 'mdi-check' : 'mdi-minus'"
        @click="updateRitual"
        v-show="ritual || editMode"
      >
        Ritual
      </v-chip>
      <v-chip
        :input-value="editMode"
        filter
        small
        color="red darken-2"
        :filter-icon="concentration ? 'mdi-check' : 'mdi-minus'"
        @click="updateConcentration"
        v-show="concentration || editMode"
      >
        Concentration
      </v-chip>
    </div>
    <div class="spell-attrs-wrapper">
      <SpellTextField
        property="range"
        label="Range"
        inline
        :editOverride="editMode"
      />
      <SpellTextField
        property="casting_time"
        label="Casting time"
        inline
        :editOverride="editMode"
      />
      <SpellTextField
        property="duration"
        label="Duration"
        inline
        :editOverride="editMode"
      />
      <SpellTextField
        property="components"
        label="Components"
        inline
        :editOverride="editMode"
      />
      <SpellTextField
        property="material"
        label="Material components"
        :editOverride="editMode"
      />
    </div>

    <SpellTextField
      property="desc"
      placeholder="Description"
      markdown
      :editOverride="editMode"
    />
    <SpellTextField
      property="higher_level"
      label="At higher levels: "
      markdown
      :editOverride="editMode"
    />

    <TagForm
      placeholder="Class"
      :tags="spell.data.dnd_class"
      :edit="editMode"
      @update="updateClasses"
      v-show="showClasses"
      v-if="Array.isArray(spell.data.dnd_class)"
    ></TagForm>
  </div>
</template>

<script>
import SpellTextField from './Forms/SpellTextField';
import CompositeSpellTextField from './Forms/CompositeSpellTextField';
import TagForm from './Forms/TagForm';
import strToBool from '../utils/strToBool';
import { createNamespacedHelpers } from 'vuex';
import { debounce } from 'lodash-es';

const { mapMutations } = createNamespacedHelpers('spells');

export default {
  props: ['spell', 'editMode'],

  data: () => ({
    collision: false,
    headerComposite: {
      level_int: 'Level (0 for cantrips)',
      school: 'School',
    }
  }),

  computed: {
    name: {
      get () {
        this.checkCollisions(this.spell.data.name);
        return this.spell.data.name;
      },
      set (value) {
        this.checkCollisions(value);
        this.updateData({ name: value });
      },
    },
    index () { return this.$store.getters['data/spellIndex']; },
    nameCollisionMsg () {
      if (!this.collision || !this.editMode) return '';

      let msg = `There is a spell from ${this.collision.tag} source with the name ${this.spell.data.name}!`;
      return msg;
    },
    showClasses () {
      return (Array.isArray(this.spell.data.dnd_class)
             && this.spell.data.dnd_class.length > 0)
             || this.editMode;
    },
    headerLabel () {
      let school = this.spell.data.school;
      let level = this.spell.data.level_int;
      if (level !== '') {
        level = level == '0' ? 'cantrip' : `level ${level}`;
      }

      return school ? `${school}, ${level}` : level;
    },
    ritual () { return strToBool(this.spell.data.ritual); },
    concentration () { return strToBool(this.spell.data.concentration); },
  },

  methods: {
    ...mapMutations({
      updateData: 'UPDATE_DATA',
      updateClasses: 'UPDATE_META',
    }),
    updateRitual () {
      if (!this.editMode) return;
      this.updateData({ ritual: !this.ritual })
    },
    updateConcentration () {
      if (!this.editMode) return;
      this.updateData({ concentration: !this.concentration })
    },
    strToBool,
    checkCollisions: debounce(function (name) {
      if (!name) {
        this.collision = false;
        return;
      }
      if (!Array.isArray(this.index) || this.index.length === 0) {
        this.collision = false;
        return;
      }

      const result = this.index.find(s => {
        return s.name.toLowerCase() === name.toLowerCase()
               && s.key !== this.spell.key;
      });

      this.collision = result === undefined ? false : result;
    }, 250),
  },

  components: {
    SpellTextField,
    CompositeSpellTextField,
    TagForm,
  }
}
</script>

<style lang="scss">
.spell-header {
  .actor-textarea-wrapper {
    margin-bottom: 0;
  }
  .textarea-label-wrapper {
    line-height: inherit;
    margin-top: 3px;
  }
}
.spell-attrs-wrapper {
  .actor-textarea-wrapper {
    margin-bottom: 5px;
  }
  margin-bottom: 10px;
}
.markdown-area {
  white-space: normal;
}
.spells-special-wrapper {
  margin-bottom: 10px;
}
</style>