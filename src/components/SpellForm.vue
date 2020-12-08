<template>
  <div class="actor-form-container">
    <h1 class="spell-header">
      <SpellTextField
        property="name"
        placeholder="Spell name"
        addClass="actor-form-name"
        inline
        :editOverride="editMode"
      />
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

    <SpellMeta :editOverride="editMode" />
  </div>
</template>

<script>
import SpellTextField from './Forms/SpellTextField';
import CompositeSpellTextField from './Forms/CompositeSpellTextField';
import SpellMeta from './Forms/SpellMeta';
import strToBool from '../utils/strToBool';
import { createNamespacedHelpers } from 'vuex';

const { mapMutations } = createNamespacedHelpers('spells');

export default {
  props: ['spell', 'editMode'],

  data: () => ({
    headerComposite: {
      level_int: 'Level (0 for cantrips)',
      school: 'School',
    }
  }),

  computed: {
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
  },

  components: {
    SpellTextField,
    CompositeSpellTextField,
    SpellMeta,
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