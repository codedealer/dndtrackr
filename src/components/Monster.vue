<template>
  <div class="list-item" :class="{'selected': index === selected}">
    <span class="current"></span>
    <div class="initiative-counter"><input class="initiative" v-model.number="initiative[index]" type="text" :tabindex="1+index"></div>
    <div class="type-counter" @click="changeType()" title="Change type monster/player">
      <div class="type-slider" :class="{'slided': monster.type}">
        <div class="type"><img src="../assets/monster.png" class="icon"></div>
        <div class="type type-player"><img src="../assets/player.png" class="icon"></div>
      </div>
    </div>
    <Autocomplete
    :suggestions="monsterList"
    :index="index"
    v-model="monster.name"
    v-show="!showInput(monster)"
    @monsterRequest="monsterRequest"
    @monsterKey="monsterKey"
    ></Autocomplete>
    <input class="ordinary-input"
    v-model="monster.nick"
    type="text"
    v-show="showInput(monster)"
    @keydown.tab.prevent = "monsterRequest(index)">
    <div class="name-button" :class="{'name-set': monster.showNick}" @click="setNickname(monster)" title="toggle custom name"><img src="../assets/edit.png" class="icon"></div>
    <div class="delete-button" @click.stop="removeItem(index)">-</div>
  </div>
</template>

<script>
import Autocomplete from './Autocomplete'
import types from '../monster-type.json'

export default {
  props: ['index', 'monster', 'userMonsters', 'monsters', 'selected', 'initiative'],
  data () {
    return {
      types
    }
  },
  computed: {
    monsterList () {
      if (!this.userMonsters.length) return this.monsters;
      if (!this.monsters.length) return this.userMonsters;

      let list = this.monsters.slice();

      for (let i = 0; i < this.userMonsters.length; i++) {
        for (let j = 0; j < this.monsters.length; j++) {
          if (this.userMonsters[i].name < this.monsters[j].name) {
            list.splice(j, 0, this.userMonsters[i]);
            break;
          }
        }
      }

      return list;
    }
  },
  methods: {
    changeType () {
      this.monster.type ^= 1;
      this.monster.showNick = true;
    },
    removeItem (index) {
      this.$emit('removeMonster', index);
    },
    setNickname (monster) {
      if (monster.type === this.types.character) return;

      monster.showNick = !monster.showNick;
    },
    showInput (monster) {
      return this.types.character === monster.type || monster.showNick;
    },
    monsterRequest (index) {
      this.$emit('monsterRequest', index);
    },
    monsterKey (key) {
      this.monster.key = key;
    }
  },
  components: {
    Autocomplete
  }
}
</script>
