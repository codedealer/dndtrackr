<template>
  <div class="list-item" :class="{'selected': index === selected, 'turn': round.order === index}">
    <span class="current"></span>
    <div class="initiative-counter"><input class="initiative" v-model.number="initiative[index]" type="text" :tabindex="1+index"></div>
    <div class="type-counter" @click="changeType()" title="Change type monster/player">
      <div class="type-slider" :class="{'slided': monster.type}">
        <div class="type"><img src="../assets/monster.png" class="icon"></div>
        <div class="type type-player"><img src="../assets/player.png" class="icon"></div>
      </div>
    </div>
    <div class="monster-input-wrapper" :class="{'expanded': expanded}">
      <Autocomplete
      :suggestions="monsterList"
      :index="index"
      :type="monster.type"
      v-model="monster.name"
      @monsterRequest="monsterRequest"
      @monsterKey="monsterKey"
      ></Autocomplete>
      <div class="character-meta-info">
        <span v-show="monster.meta.rstealth">S:</span>{{monster.meta.rstealth}}
        <span v-show="monster.meta.ac.length">AC:</span>{{monster.meta.ac}}
        <span v-show="monster.meta.perception.length">P:</span>{{monster.meta.perception}}
      </div>
    </div>
    <div class="color-picker" :class="monster.color.name">
      <div class="color-dropdown">
        <div class="color-item" v-for="(code, index) in COLOR" :class="{[code.name]: true, 'selected': code.name == monster.color.name}" @click.stop="selectColor(index)"></div>
      </div>
    </div>
    <div class="delete-button" @click.stop="removeItem(index)">-</div>
  </div>
</template>

<script>
import Autocomplete from './Autocomplete'
import types from '../monster-type.json'
import COLOR from '../color-codes.json'

export default {
  props: ['index', 'monster', 'monsterList', 'selected', 'initiative', 'round'],
  data () {
    return {
      types,
      COLOR
    }
  },
  computed: {
    expanded () {
      //if (this.selected === this.index) return false;
      if (this.monster.type !== this.types.character) return false;

      return this.monster.meta.ac.length || this.monster.meta.rstealth.length || this.monster.meta.perception.length;
    }
  },
  methods: {
    changeType () {
      // if we switch to player while name is already set
      // copy it to custom name too
      if (this.types.monster === this.monster.type &&
        this.monster.name.length) {
      }

      this.monster.type ^= 1;
    },
    removeItem (index) {
      this.$emit('removeMonster', index);
    },
    monsterRequest (index) {
      this.$emit('monsterRequest', index);
    },
    monsterKey (key) {
      this.monster.key = key;
    },
    selectColor (index) {
      if (COLOR.hasOwnProperty(index)) {
        this.monster.color = COLOR[index];
      }
    }
  },
  components: {
    Autocomplete
  }
}
</script>


<style lang="scss">
.color-picker {
  width: 26px;
  height: 32px;
  position: relative;
  box-sizing: border-box;
  border-left: 1px solid #ebebeb;
  border-right: 1px solid #ebebeb;
  cursor: pointer;
  .color-dropdown {
    position: absolute;
    top: 32px;
    left: 0;
    width: 26px;
    z-index: 101;
    display: none;
  }
  &:hover .color-dropdown {
    display: block;
  }
  .color-item {
    width: 26px;
    height: 26px;
    cursor: pointer;
    box-sizing: border-box;
    border: 1px solid #ebebeb;
    border-bottom: none;
    &.selected {
      border-color: #aac;
      border-bottom: 1px solid #aac;
    }
    &.selected + .color-item {
      border-top: none;
    }
  }
}
 .white {
  background-color: #fff;
 }
 .red {
  background-color: #ca331a;
 }
 .blue {
  background-color: #2775c7;
 }
 .green {
  background-color: #1c9e1c;
 }
 .orange {
  background-color: #ca780f;
 }
 .purple {
  background-color: #840fca;
 }
 .pink {
  background-color: #e678b9;
 }
 .yellow {
  background-color: #d8ca11;
 }
</style>
