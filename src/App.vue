<template>
  <div id="app">
    <div class="controls">
      <div class="list-control">
        <a href="#" class="control-button add-monster" @click.prevent="addMonster" title="add new monster">+</a>
        <a href="#" class="control-button rename-monster" @click.prevent="renameMonsters" v-show="monsters.length" title="rename monster duplicates"><img src="./assets/rename.png" class="icon"></a>
        <a href="#" class="control-button" @click.prevent="generateInitiative" v-show="monsters.length" title="generate monsters' initiative"><img src="./assets/init.png" class="icon"></a>
        <a href="#" class="control-button sort-monster" @click.prevent="sortMonsters" v-show="monsters.length" title="sort by initiative"><img src="./assets/sort.png" class="icon"></a>
      </div>
      <div class="combat-control">
        <dice-roller></dice-roller>
        <div class="control-item">
          <div class="hits-wrapper" v-show="showHits">
            <input v-model.number="hitpoints" class="hits">
            <span class="hit-modifier" @click.stop="changeSign">{{hitSign}}</span>
            <input v-model.number="hitMod" class="hit-mod" @keydown.enter.stop="calcHits">
          </div>
          <div class="hit-name">{{monsterName}}</div>
        </div>
      </div>
      <div class="spell-control">
        <Spellfinder
        :suggestions="spellNames"
        v-model="currentSpell"
        ></Spellfinder>
        <div id="ui-container" v-show="!user.state"></div>
        <div class="user-container" v-show="user.state">
          <div class="user-icon" @click.stop="showUserMenu ^= 1">{{userShortName}}</div>
          <div class="user-menu" v-show="showUserMenu">
            <div class="user-action" @click.stop="showAddForm ^= 1">Toggle add from</div>
            <div class="user-action" @click.stop="server.signOut">Sign Out</div>
          </div>
        </div>
      </div>
    </div>
    <div class="monster-container" v-show="!showAddForm">
      <div class="list">
        <div class="list-fix">
          <div v-for="(monster, index) in monsters">
            <div class="list-item" :class="{'selected': index === selected}" @click="selectItem(index)">
              <span class="current"></span>
              <div class="initiative-counter"><input class="initiative" v-model.number="initiative[index]" type="text" :tabindex="1+index"></div>
              <div class="type-counter" @click="changeType(index)" title="Change type monster/player">
                <div class="type-slider" :class="{'slided': monster.type}">
                  <div class="type"><img src="./assets/monster.png" class="icon"></div>
                  <div class="type type-player"><img src="./assets/player.png" class="icon"></div>
                </div>
              </div>
              <Autocomplete
              :suggestions="monsterList"
              :index="index"
              v-model="monster.key"
              v-show="!showInput(monster)"
              @monsterRequest="onMonsterRequest"
              ></Autocomplete>
              <input class="ordinary-input"
              v-model="monster.nick"
              type="text"
              v-show="showInput(monster)"
              @keydown.tab.prevent = "onMonsterRequest(index)">
              <div class="name-button" :class="{'name-set': monster.showNick}" @click="setNickname(monster)" title="toggle custom name"><img src="./assets/edit.png" class="icon"></div>
              <div class="delete-button" @click.stop="removeItem(index)">-</div>
            </div>
          </div>
        </div>
      </div>
      <div class="info">
        <Info v-for="(monster, index) in monsters"
        :monster="monster"
        :id="monster.key"
        :key="monster.initiative"
        v-show="index == selected && monster.type === types.monster"
        ></Info>
      </div>
      <SpellInfo :id="currentSpell"></SpellInfo>
    </div>
    <AddForm v-if="user.state" v-show="showAddForm" :user="user"></AddForm>
  </div>
</template>

<script>
import Autocomplete from './components/Autocomplete'
import Spellfinder from './components/Spellfinder'
import AddForm from './components/AddForm'
import SpellInfo from './components/SpellInfo'
import Info from './components/Info'
import diceRoller from './components/dice-roller'
import Server from './server'
import Monster from './monster'
import types from './monster-type.json'
import random from './random'

export default {
  name: 'app',
  mounted () {
    this.server.connect(this.user);
    this.server.fetchNames().then(data => {
      this.names = data;
      this.server.fetchSpells().then(spellNames => {
        this.spellNames = spellNames;
      });
    });
  },
  data () {
    return {
      server: Server,
      user: {
        state: 0,
        displayName: '',
        monsters: [],
        uid: ''
      },
      names: [],
      spellNames: [],
      currentSpell: '',
      initiative: [],
      monsters: [],
      types,
      random,
      selected: -1,
      hitSign: '-',
      hitMod: '',
      showAddForm: 0,
      showUserMenu: 0
    }
  },
  computed: {
    monsterList () {
      if (!this.user.monsters.length) return this.names;
      if (!this.names.length) return this.user.monsters;

      let list = this.names.slice();

      for (let i = 0; i < this.user.monsters.length; i++) {
        for (let j = 0; j < this.names.length; j++) {
          if (this.user.monsters[i].name < this.names[j].name) {
            list.splice(j, 0, this.user.monsters[i]);
            break;
          }
        }
      }

      return list;
    },
    hitpoints: {
      get () {
        if (this.selected === -1 || this.selected >= this.monsters.length) return 0;

        return this.monsters[this.selected].health;
      },
      set (value) {
        if (this.monsters[this.selected] && this.monsters[this.selected].type === this.types.monster) {
          let health = parseInt(value, 10);

          if (!isNaN(health)) this.monsters[this.selected].health = health;
        }
      }
    },
    userShortName () {
      if (!this.user.displayName) return '';

      let name = this.user.displayName.split(' ');
      let shortName = name[0][0];
      if (name.length > 1) shortName += name[1][0];
      return shortName;
    },
    showHits () {
      if (this.selected === -1 || this.selected >= this.monsters.length) return false;
      if (this.monsters[this.selected].type === this.types.character) return false;
      if (this.monsters[this.selected].name.length === 0) return false;

      return true;
    },
    monsterName () {
      if (!this.showHits) return '';

      if (this.monsters[this.selected].nick && this.monsters[this.selected].showNick) return this.monsters[this.selected].nick;

      return this.monsters[this.selected].name;
    }
  },
  methods: {
    addMonster () {
      this.monsters.push(new Monster());
      this.initiative.push(0);
      this.selected = this.monsters.length - 1;
    },
    selectItem (index) {
      this.selected = index;
    },
    removeItem (index) {
      this.selected = -1;
      this.monsters.splice(index, 1);
      this.initiative.splice(index, 1);
      this.$emit('item-removed', this.monsters);
    },
    changeType (index) {
      this.monsters[index].type ^= 1;
    },
    sortMonsters () {
      this.monsters.forEach((monster, i) => {
        monster.initiative = this.initiative[i] || 0;
      });

      this.monsters.sort((a, b) => {
        // do not shift items until initiative is set
        if (a.initiative === 0) return 1;
        if (a.type === b.type) return a.initiative > b.initiative ? -1 : 1;

        if (a.initiative === b.initiative) return a.type === this.types.character ? -1 : 1;

        return a.initiative > b.initiative ? -1 : 1;
      });

      this.initiative = this.monsters.map(monster => monster.initiative);
      this.$emit('items-sorted', this.monsters);
    },
    showInput (monster) {
      return this.types.character === monster.type || monster.showNick;
    },
    setNickname (monster) {
      monster.showNick = !monster.showNick;
    },
    renameMonsters () {
      let duplicates = [];

      this.monsters.forEach((monster, index, arr) => {
        if (!monster.name.length || monster.type === this.types.character) return;
        if (duplicates.includes(monster.name)) return;

        arr.forEach((m, i) => {
          if (monster.name === m.name && index !== i) duplicates.push(monster.name);
        });
      });

      duplicates.forEach((name) => {
        let i = 1;
        this.monsters.forEach((monster) => {
          if (monster.name === name) {
            monster.nick = `${name} ${i}`;
            i++;
            monster.showNick = true;
          }
        });
      });
    },
    onMonsterRequest (index) {
      if (this.monsters.length - 1 > index) return this.tab(index);

      this.addMonster();
      this.$nextTick(() => { this.tab(index) });
    },
    tab (index) {
      let next = index + 1;
      let inputs = document.getElementsByClassName('form-control');

      if (next < inputs.length) inputs[next].focus();
    },
    generateInitiative () {
      this.monsters.forEach((monster, i) => {
        if (monster.type === this.types.character) return;

        this.random.get(20).then(data => {
          this.initiative.splice(i, 1, data[0] + monster.dex);
        });
      });
    },
    changeSign () {
      if (this.hitSign === '+') {
        this.hitSign = '-';
      } else {
        this.hitSign = '+';
      }
    },
    calcHits () {
      if (!this.hitMod || !this.showHits) return;

      let mod = parseInt(this.hitMod, 10);
      if (isNaN(mod)) return;

      if (this.hitSign === '+') {
        this.hitpoints += mod;
      } else {
        this.hitpoints -= mod;
      }
      this.hitMod = '';
    }
  },
  components: {
    Autocomplete,
    Info,
    diceRoller,
    Spellfinder,
    SpellInfo,
    AddForm
  }
}
</script>

<style lang="scss">
html {
  height: 100%;
}
body {
  margin: 0;
  height: calc(100% - 53px);
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
}
.icon {
  display: inline-block;
  width: 32px;
  height: 32px;
}
.control-button {
  display: inline-block;
  width: 32px;
  height: 32px;
  text-decoration: none;
  color: #fff;
  border-radius: 50%;
  line-height: 32px;
  font-size: 24px;
  background: #f1cea0;
  text-align: center;
  transition: all .6s ease-in-out;
  margin-left: 15px;
}
.add-monster {
  background: #f18a50;
}
.controls {
  position: fixed;
  text-align: left;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  background-color: #fff;
}
.monster-container,
.controls {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: left;
  align-content: stretch;
  align-items: stretch;
}
.monster-container {
  margin-top: 53px;
  min-height: 100%;
}
.list-fix {
  height: 100%;
  position: fixed;
  top: 53px;
  left: 0;
  width: 320px;
}
.list,
.list-control {
  order: 0;
  flex: 0 0 320px;
  align-self: auto;
}
.list-control {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: left;
}
.info,
.combat-control {
  background: #ddd;
  order: 0;
  flex: 0 0 500px;
  align-self: auto;
  max-width: 600px;
}
.monster-stat {
  text-align: left;
  padding: 30px 25px;
  > div:first-of-type {
    border-bottom: 1px solid;
    margin-bottom: 20px;
  }
}

.attributes {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: space-around;
  align-content: center;
  align-items: stretch;
  margin: 10px 0;
  .p-5 {
    order: 0;
    flex: 0 1 auto;
    align-self: auto;
  }
}
.spell-control {
  order: 0;
  flex: 1 1 auto;
  align-self: auto;
  text-align: left;
  padding-left: 25px;
  position: relative;
  .dropdown-menu {
    text-align: center;
  }
  max-width: 500px;
}
.controls {
  border-bottom: 1px solid #ebebeb;
}
.combat-control,
.list-control {
  padding: 10px 0;
}
.combat-control {
  background-color: #fff;
  border-left: 1px solid #ebebeb;
  border-right: 1px solid #ebebeb;
  box-sizing: border-box;
  max-width: 100%;
  display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: space-around;
    padding: 5px 0;
}
.control-item {
  flex: 0 1 auto;
  align-self: auto;
  height: 42px;
}
.list-item {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: stretch;
  align-content: stretch;
  align-items: stretch;
  border-bottom: 1px solid #ebebeb;
  position: relative;
}
.initiative-counter {
  background: #aac;
  flex: 0 0 32px;
}
.initiative {
  width: 32px;
  height: 32px;
  line-height: 32px;
  font-size: 24px;
  text-align: center;
  background: #aac;
  border: none;
  padding: 0;
}
.type-counter,
.name-button {
  background: #bebebe;
  height: 32px;
  width: 32px;
  height: 32px;
  font-size: 24px;
  color: #fff;
  cursor: pointer;
}
.name-button{
  transition: background-color .4s;
}
.name-set {
  background: #4390ac;
}
.form-control,
.ordinary-input {
  padding: 2px 5px;
  font-size: 14px;
  width: 165px;
  margin: 3px 2px;
}
.delete-button {
  height: 32px;
  width: 32px;
  font-size: 24px;
  color: #fff;
  line-height: 32px;
  background: #ca331a;
  flex: 1 1 auto;
  cursor: pointer;
  text-align: center;
}
.current {
  display: none;
  position: absolute;
  top: 10px;
  right: -5px;
  width: 10px;
  height: 10px;
  transform: rotate(45deg);
  background: #ddd;
}
.selected {
  .current{
    display: block;
  }
  .initiative {
    background: #ecac22;
  }
}
.type-counter {
  overflow: hidden;
  cursor: pointer;
  color: #fff;
  .type-slider {
    transition: all .6s ease-in-out;
    width: 32px;
    height: 64px;
    &.slided {
      transform: translateY(-32px);
    }
  }
  .type {
    height: 32px;
  }
  .type-player {
    background: #4333ea;
  }
}
.hit-name {
  width: 200px;
  font-size: 12px;
  font-style: italic;
  white-space: nowrap;
}
.hits {
  margin-top: 5px;
  width: 40px;
}
.hits-wrapper {
  input {
    display: inline-block;
  }
  .hit-mod {
    width: 30px;
  }
  .hit-modifier {
    font-size: 18px;
    line-height: 18px;
    padding-bottom: 3px;
    cursor: pointer;
    background: #f1cea0;
    border-radius: 50%;
    display: inline-block;
    width: 16px;
    height: 16px;
    text-align: center;
    color: #fff;
  }
}
.open .dropdown-menu{
  display: block;
}
.dropdown-menu {
  z-index: 100;
  list-style: none;
  padding-left: 0;
  display: none;
  max-height: 300px;
  overflow-y: scroll;
  overflow-x: hidden;
  position: absolute;
  top: 32px;
  left: 0;
  width: 320px;
  margin: 0;
  li {
    padding: 10px;
    width: 320px;
    background: #eee;
    &.active {
      background: #bebebe;
    }
  }
}
.pointer {
  cursor: pointer;
}
.f-s-24 {
  font-size: 24px;
}
.f-s-18 {
  font-size: 18px;
}
.f-w-b {
  font-weight: bold;
}
.m-l-10 {
  margin-left: 10px;
}
.m-t-20 {
  margin-top: 20px;
}
.i {
  border-bottom: 1px solid;
  margin-bottom: 5px;
}
#ui-container {
  display: inline-block;
  position: absolute;
  top: 10px;
  right: 20px;
  form {
    display: inline-block;
  }
}
.firebaseui-idp-list {
  display: inline-block;
  list-style: none;
  margin: 0 0 0 20px;
  padding: 0;
  button {
    height: 24px;
    .firebaseui-idp-text-long {
      display: none;
    }
    .firebaseui-idp-text-short {
      margin-left: 2px;
      vertical-align: top;
      display: inline-block;
    }
    img {
      width: 16px;
      height: 16px;
    }
  }
}
.user-container {
  @extend #ui-container;
  height: 40px;
  top: 5px;
  .user-icon {
    text-align: center;
    font-size: 18px;
    line-height: 40px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #f1cea0;
    color: #fff;
    cursor: pointer;
  }
  .user-menu {
    width: 160px;
    position: absolute;
    top: 48px;
    right: 0;
    background: #ebebeb;
    .user-action {
      padding: 5px 10px;
      &:hover {
        background: #aaa;
      }
      cursor: pointer;
    }
  }
}
</style>
