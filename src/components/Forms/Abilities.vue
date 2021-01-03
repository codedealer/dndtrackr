<template>
  <div class="actor-abilities-container">
    <Skills
      :index="index"
    />
    <TextArea
      property="damage_vulnerabilities"
      :index="index"
      label="Damage Vulnerabilities"
      :editOverride="editOverride"
    />
    <TextArea
      property="damage_resistances"
      :index="index"
      label="Damage Resistances"
      :editOverride="editOverride"
    />
    <TextArea
      property="damage_immunities"
      :index="index"
      label="Damage Immunities"
      :editOverride="editOverride"
    />
    <TextArea
      property="condition_immunities"
      :index="index"
      label="Condition Immunities"
      :editOverride="editOverride"
    />
    <TextArea
      property="senses"
      :index="index"
      label="Senses"
      :editOverride="editOverride"
    />
    <TextArea
      property="languages"
      :index="index"
      label="Languages"
      :editOverride="editOverride"
    />
     <CompositeTextField
        :propertyMap="xpComposite"
        :index="index"
        :label="xpLabel"
        prepend="Challenge"
        :editOverride="editOverride"
      />
  </div>
</template>

<script>
import Skills from './Skills';
import TextField from './TextField';
import TextArea from './TextArea';
import CompositeTextField from './CompositeTextField';

export default {
  props: ['index', 'actor', 'editOverride'],

  computed: {
    xpComposite () {
      return {
        xp: 'XP',
        challenge_rating: 'Challenge rating',
      }
    },
    xpLabel () {
      if (!this.actor.data.xp && this.actor.data.xp !== 0) return this.actor.data.challenge_rating;
      return `${this.actor.data.challenge_rating} (${this.actor.data.xp} XP)`;
    },
  },

  components: {
    Skills,
    TextField,
    CompositeTextField,
    TextArea,
  }
}
</script>