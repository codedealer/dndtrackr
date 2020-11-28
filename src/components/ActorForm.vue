<template>
  <div class="actor-form-container">
    <h1>
      <v-text-field
        hide-details
        dense
        v-model="name"
        height="46"
        class="actor-form-name"
      ></v-text-field>
    </h1>
    <div class="actor-subheader">
      <CompositeTextField
        :propertyMap="typeComposite"
        :index="index"
        :label="typeLabel"
        :editOverride="editMode"
        v-show="editMode || typeLabel.length"
      />
    </div>

    <v-expansion-panels class="actor-notes-container" v-model="notesPanel">
      <v-expansion-panel>
        <v-expansion-panel-header>
          Notes
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-textarea
            filled
            auto-grow
            class="notes-textarea"
            v-model="notes"
          ></v-textarea>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>

    <div class="actor-divider primary"></div>

    <CompositeTextField
      :propertyMap="armorComposite"
      :index="index"
      :label="armorLabel"
      :editOverride="editMode"
      prepend="Armor Class"
    />
    <CompositeTextField
      :propertyMap="hpComposite"
      :index="index"
      :label="hpLabel"
      :editOverride="editMode"
      prepend="Hit Points"
      :append="hpAvg"
    />
    <TextField property="speed" :index="index" label="Speed" :editOverride="editMode" />

    <div class="actor-divider primary"></div>

    <div class="actor-attributes-container" v-if="actor.settings.showAttributes">
      <Attribute
        v-for="(attribute, attributeName) in actor.data.attributes"
        :attributeName="attributeName"
        :attribute="attribute"
        :index="index"
        :actor="actor"
      />
    </div>

    <div class="actor-divider primary" v-if="actor.settings.showAttributes"></div>

    <Abilities :index="index" :actor="actor" :editOverride="editMode" />

    <div class="actor-divider primary"></div>

    <ArrayBlock
      :index="index"
      property="special_abilities"
      :editOverride="editMode"
    />
    <ArrayBlock
      :index="index"
      property="actions"
      :editOverride="editMode"
    >
      <h2 class="actor-form-title">Actions</h2>
      <div class="actor-divider primary"></div>
    </ArrayBlock>
    <ArrayBlock
      :index="index"
      property="reactions"
      :editOverride="editMode"
    >
      <h2 class="actor-form-title">Reactions</h2>
      <div class="actor-divider primary"></div>
    </ArrayBlock>
    <ArrayBlock
      :index="index"
      property="legendary_actions"
      :editOverride="editMode"
    >
      <h2 class="actor-form-title">Legendary actions</h2>
      <div class="actor-divider primary"></div>
      <TextArea
        :index="index"
        property="legendary_desc"
        label=""
        :editOverride="editMode"
      />
    </ArrayBlock>
  </div>
</template>

<script>
import TextField from './Forms/TextField';
import TextArea from './Forms/TextArea';
import Attribute from './Forms/Attribute';
import Abilities from './Forms/Abilities';
import ArrayBlock from './Forms/ArrayBlock';
import CompositeTextField from './Forms/CompositeTextField';
import Parser from '../parser';
import DiceResult from '../parser/diceResult';
import { createNamespacedHelpers } from 'vuex';
const { mapMutations } = createNamespacedHelpers('encounter');

export default {
  props: ['actor', 'index', 'editMode'],

  data: () => ({
    n: [],
  }),

  computed: {
    name: {
      get () { return this.actor.name },
      set (value) {
        this.updateName({ index: this.index, value });
      },
    },
    notes: {
      get () { return this.actor.notes },
      set (value) {
        this.updateNotes({ index: this.index, value });
      }
    },
    notesPanel: {
      get () { return this.actor.settings.collapseNotes ? undefined : 0 },
      set (value) {
        if (value === 0) {
          this.updateSettings({ index: this.index, collapseNotes: false });
        } else {
          this.updateSettings({ index: this.index, collapseNotes: true });
        }
      }
    },
    typeComposite () { return {
      size: 'Size',
      type: 'Type',
      subtype: 'Subtype',
      alignment: 'Alignment',
    } },
    typeLabel () {
      let result = this.actor.data.size;
      if (this.actor.data.type) {
        result += result.length > 0 ? ` ${this.actor.data.type}` : this.actor.data.type;
      }
      if (this.actor.data.subtype) {
        result += result.length > 0 ? ` (${this.actor.data.subtype})` : this.actor.data.subtype;
      }
      result += result.length > 0 ? `, ${this.actor.data.alignment}` : this.actor.data.alignment;

      return result;
    },
    armorComposite () { return { armor_class: 'Armor Class', armor_desc: 'Armor Type' } },
    armorLabel () {
      if (!this.actor.data.armor_class && !this.actor.data.armor_desc.length) return '0';
      let ac = this.actor.data.armor_class || 1;
      if (this.actor.data.armor_desc.length) {
        return `${ac} (${this.actor.data.armor_desc})`;
      }

      return ac;
    },
    hpComposite () { return { hit_points: 'Hit Points', hit_dice: 'Hit Dice' } },
    hpLabel () {
      if (!this.actor.data.hit_dice.length) return this.actor.data.hit_points;
      let hd = this.actor.data.hit_dice;
      if (this.hpAvg) {
        hd = `(${hd} / ${this.hpAvg})`;
      }
      return `${this.actor.data.hit_points} ${hd}`;
    },
    hpAvg () {
      const dice = this.actor.data.hit_dice;
      if (!dice) return '';
      if (Parser.test(dice) !== true) return '';

      const diceParams = Parser.parse(dice);
      const diceResult = new DiceResult(diceParams);

      return diceResult.average();
    },
  },

  methods: {
    ...mapMutations({
      updateName: 'SET_ACTOR_NAME',
      updateNotes: 'SET_ACTOR_NOTES',
      updateSettings: 'UPDATE_SETTINGS',
    }),
  },

  components: {
    TextField,
    CompositeTextField,
    Attribute,
    Abilities,
    ArrayBlock,
    TextArea,
  }
}
</script>

<style lang="scss">
.actor-form-container {
  padding: 0 5px;
  .actor-form-name {
    font-size: 32px;
    input {
      max-height: 50px;
    }
    > .v-input__control > .v-input__slot:before {
      border-color: transparent;
    }
  }
  .actor-divider {
    height: 2px;
    background-color: currentColor;
    margin: 10px 0;
  }
  .actor-subheader {
    display: flex;
    font-style: italic;
    color: #bebebe;
    .actor-text-field.v-input > .v-input__control input {
      color: #bebebe;
    }
  }
  .actor-attributes-container {
    display: flex;
    justify-content: space-around;
    padding-bottom: 10px;
  }
  .v-btn.actor-label-text-btn,
  .v-btn.actor-label-btn {
    text-transform: none;
    padding-left: 0px;
    padding-right: 2px;
    min-width: 20px;
    margin-right: 10px;
    margin-bottom: 6px;
    font-size: 16px;
    font-weight: 700;
    letter-spacing: normal;
    height: 24px;
    vertical-align: inherit;
    justify-content: flex-start;
  }
}
.actor-textarea-wrapper {
  margin-bottom: 10px;
}
.textarea-label-wrapper {
  line-height: 25px;
  white-space: break-spaces;
  .v-btn.actor-label-text-btn {
    margin-bottom: 0;
  }
}
.actor-notes-container {
  margin: 10px 0;
}
</style>