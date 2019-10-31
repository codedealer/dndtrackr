<template>
  <div class="form-container">
    <div class="spell-stat">
      <h1 class="spell-form-title">Add new spell</h1>
      <div class="spell-form-wrapper">
        <div class="p-b-20">
          <span class="f-s-24 f-w-b"><input v-model.trim="spell.name" placeholder="Name"></span>
          <div class="f-s-18 i f-w-b"><input placeholder="Type" class="monster-type" v-model.trim="spell.type"></div>
        </div>
        <div class="spell-main-prop">
          <span class="f-w-b">Casting Time:</span><span class="m-l-10"><input v-model.trim="spell.time"></span>
        </div>
        <div class="spell-main-prop">
          <span class="f-w-b">Range:</span><span class="m-l-10"><input v-model.trim="spell.range"></span>
        </div>
        <div class="spell-main-prop">
          <span class="f-w-b">Duration:</span><span class="m-l-10"><input v-model.trim="spell.duration"></span>
        </div>
        <div class="spell-main-prop">
          <span class="f-w-b">Components:</span><span class="m-l-10"><input v-model.trim="spell.components"></span>
        </div>

        <div class="spell-props">

          <div v-for="p in spell.ps">
            <textarea v-model.trim="p.content" cols="70" rows="5"></textarea>
          </div>
          <p>Add Paragraph <a href="#" @click.prevent="addSpellParagraph" class="control-button">+</a></p>
        </div>

        <div class="form-butttons">
          <a href="#" @click.prevent="submit" v-show="!working">Save</a>
          <span v-show="working">saving...</span>
          <a href="#" @click.prevent="reset">Reset</a>
        </div>
      </div>
    </div>
    <div class="user-list">
      <div class="user-spell" v-for="(spell, index) in user.spells">
        <span class="user-monster-name">{{spell.name}}</span><span class="delete-button" @click.stop="remove(spell, index)">-</span>
      </div>
    </div>
  </div>
</template>

<script>
import Server from '../server'

export default {
  props: ['user'],
  data () {
    return {
      spell: {
        name: '',
        type: '',
        time: '',
        range: '',
        duration: '',
        components: '',
        ps: []
      },
      working: false
    }
  },
  methods: {
    reset () {
      this.spell = {
        name: '',
        type: '',
        time: '',
        range: '',
        duration: '',
        components: '',
        ps: []
      }
    },
    submit () {
      if (!this.spell.name || !this.spell.type) return;

      let duplicate = this.user.spells.some(spell => {
        return spell.name.toLowerCase() === this.spell.name.toLowerCase()
      });

      if (duplicate) {
        this.spell.name = '!NAME DUPLICATE';
        return;
      }

      this.spell.ps = this.spell.ps.filter(a => a.content.length);

      this.working = true;

      Server.addSpell(this.user, this.spell).then(() => {
        this.working = false;
      });
    },
    addSpellParagraph () {
      this.spell.ps.push({content: ''});
    },
    remove (spell, index) {
      this.user.spells.splice(index, 1);
      Server.removeSpell(spell);
    }
  }
}
</script>

<style lang="scss">
@import '../assets/var';

.spell-form-title {
  margin-top: 50px;
}
  .spell-form-wrapper {
    input {
      margin-bottom: 5px;
    }
    .spell-main-prop span.f-w-b{
      display: inline-block;
      width: 110px;
    }
    .spell-props {
      margin-top: 30px;
    }
    .spell-props textarea {
      max-width: 445px;
    }
  }
  .user-list {
    .user-spell {
      background: $secondary;
    }
  }
</style>
