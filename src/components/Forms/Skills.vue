<template>
  <div class="actor-skills-container" v-click-outside="stopEdit">
    <div class="skills-label-wrapper" v-show="!edit">
      <v-btn
        text
        class="actor-label-text-btn"
        @click="startEdit()"
      >Skills</v-btn>
      <v-chip
        small
        v-for="(skillValue, skillName) in skills"
      >{{ skillName }}: {{ mod(skillValue) }}</v-chip>
    </div>
    <div class="skills-input-wrapper" v-show="edit">
      <v-text-field
        dense
        v-model="skill"
        placeholder="Skill: value"
        :error-messages="errors"
        @keydown.enter = 'addSkills'
      ></v-text-field>
      <v-chip
        v-for="(skillValue, skillName) in skills"
        small
        close
        close-icon="mdi-delete"
        @click:close="removeSkill(skillName)"
      >{{ skillName }}: {{ mod(skillValue) }}</v-chip>
    </div>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex';
import statUtils from '../../utils/statUtils';
const { mapMutations, mapState } = createNamespacedHelpers('encounter');

export default {
  props: ['index',],

  data: () => ({
    edit: false,
    skill: '',
    errors: [],
  }),

  computed: {
    ...mapState(['actors']),
    skills () {
      return this.actors[this.index].data.skills;
    },
    skillsLabel () {
      return Object.entries(this.actors[this.index].data.skills).map(kv => `${kv[0]}: ${kv[1]}`).join(', ');
    },
  },

  methods: {
    ...mapMutations({
      updateData: 'UPDATE_DATA',
      deleteSkill: 'REMOVE_SKILL',
    }),
    startEdit () {
      this.edit = true;
    },
    stopEdit () {
      this.edit = false;
    },
    addSkills () {
      let skills = this.skill.split(',');
      skills.forEach(s => { this.addSkill(s.trim()) });
      this.skill = '';
    },
    addSkill (skill) {
      if (!(/\w+\s*\:\s*.+/.test(skill))) {
        this.errors.push('hint: Skill: value');
        return;
      }

      this.errors = [];
      let s = skill.split(':');
      const skillName = s[0].trim();
      const skillValue = s[1].trim();

      this.updateData({
        index: this.index,
        skills: {
          [skillName]: skillValue,
        }
      });
    },
    removeSkill (skillName) {
      this.deleteSkill({ index: this.index, skill: skillName });
    },
    mod: (skill) => statUtils.fixMod(skill),
  }
}
</script>

<style lang="scss">
.actor-skills-container {
  .v-chip {
    margin-right: 4px;
    margin-bottom: 6px;
  }
}
.skills-label-wrapper {
  display: flex;
  flex-wrap: wrap;
  align-items: center;

}
</style>