<template>
  <div id="app" :class="mobileAppClass">
    <div class="controls">
      <div class="list-control">
        <img src="static/puff.svg" class="icon-loader" v-show="!isNamesLoaded">
        <span class="s-loader" v-show="!isNamesLoaded">Filling bestiary...</span>
        <a href="#" class="control-button add-monster" @click.prevent="addMonster()" v-show="isNamesLoaded" title="add new monster">+</a>
        <a href="#" class="control-button"
        @click.exact.prevent="generateInitiative(false)"
        @click.ctrl.prevent="generateInitiative(true)"
        @click.meta.prevent="generateInitiative(true)"
         v-show="monsters.length" title="generate monsters' initiative"><img src="./assets/init.png" class="icon"></a>
        <a href="#" class="control-button sort-monster" @click.prevent="sortMonsters" v-show="monsters.length" title="sort by initiative"><img src="./assets/sort.png" class="icon"></a>
        <a href="#" class="control-button rename-monster" @click.prevent="renameMonsters" v-show="monsters.length" title="rename monster duplicates"><img src="./assets/rename.png" class="icon"></a>
        <RoundCounter
        v-show="monsters.length"
        :round="round"
        @nextOrder="nextOrder"
        ></RoundCounter>
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
        <img src="static/puff.svg" class="icon-loader" v-show="!isSpellsLoaded">
        <span class="s-loader" v-show="!isSpellsLoaded">Fetching spellbooks...</span>
        <Spellfinder
        :suggestions="spellList"
        v-model="currentSpell"
        v-show="isSpellsLoaded"
        ></Spellfinder>
        <div id="ui-container" v-show="!user.state"></div>
        <div class="user-container" v-show="user.state">
          <div class="user-icon" @click.stop="showUserMenu ^= 1">{{userShortName}}</div>
          <div class="user-menu">
            <div class="user-action" @click.stop="form = 0">Tracker</div>
            <div class="user-action" @click.stop="form = 1">Monster form</div>
            <div class="user-action" @click.stop="form = 2">Spell form</div>
            <div class="user-action" @click.stop="server.signOut">Sign Out</div>
          </div>
        </div>
      </div>
    </div>
    <div class="monster-container" v-show="form == 0">
      <div class="list">
        <div class="list-fix-wrapper">
          <div class="list-fix">
            <div class="tips" v-show="monsters.length == 0">
              <h1>Dungeons &amp; Dragons Initiative Tracker</h1>
              <p>Press + to add a monster</p>
              <ul>
                <li>Type a name of a monster in the field. Suggestions will pop up. Once you chose a monster its info will appear on the right side of the page.</li>
                <li>You can press &laquo;Tab&raquo; while in the field to quickly create the next monster.</li>
                <li>Press monster icon to change the type to player. Players do not have info/health tracking and initiative is not generated for them. It is important to change the type for your players for initiative sorting to work properly.</li>
                <li>Once done you can press pen icon to give monsters custom names or rename all duplicates automaticaly with the button on the top.</li>
                <li>Press dice icon to generate monsters' initiative (taken their dexterity into account if info is available) and then sort it.</li>
              </ul>
            </div>
            <div v-for="(monster, index) in monsters" :key="monster.uid" @click="selectItem(index)">
              <Monster
              :monster="monster"
              :index="index"
              :monsterList="monsterList"
              :selected="selected"
              :initiative="initiative"
              :round="round"
              @monsterRequest="onMonsterRequest"
              @removeMonster="onRemoveMonster"></Monster>
            </div>
          </div>
        </div>
        <Xp :monsters="monsters"
            :removed="removedMonsters"
            :monsterList="monsterList"
            :user="user"
            :server="server"
            @killMonster="addToRemoved"
            @reviveMonster="cancelRemoved"
            @resetXp="resetXp"
            @loadPlayers="loadPlayers"
        ></Xp>
      </div>
      <div class="info">
        <div class="dice-tips tips" v-show="monsters.length == 0">
          <p>Dice Roller</p>
          <ul>
            <li>You can roll up to 100 dice at a time with modifiers calculated automatically.</li>
            <li>Press on the result number to open expanded window which will show how the result is calculated.</li>
            <li>You can also roll with (dis)advantage. Add 'a' or 'd' at the end of the line to roll with advantage/disadvantage respectfully.</li>
            <li>If you want a simple die roll just type the number of sides on the die (e.g. 10 will roll one d10). Another shorthand is rolling d20 with a modifier: just type the modifier (e.g. +3).</li>
            <li>Circle through previous results (up to 100) by pressing up and down arrows while inside the roller field.</li>
          </ul>
        </div>
        <Info v-for="(monster, index) in monsters"
        :monster="monster"
        :id="monster.key"
        :key="monster.uid"
        @requestDiceRoll="onRequestDiceRoll"
        v-show="index == selected"
        ></Info>
      </div>
      <SpellInfo :id="currentSpell"></SpellInfo>
    </div>
    <AddForm v-if="user.state" v-show="form == 1" :user="user"></AddForm>
    <SpellForm v-if="user.state" v-show="form == 2" :user="user"></SpellForm>
    <div class="mobile-nav">
      <!--div id="#nav-xp" class="mobile-nav-button">XP</div-->
      <div id="nav-list" class="mobile-nav-button" @click.stop="mobileCurrentTab='nav-list'">L</div>
      <div id="nav-info" class="mobile-nav-button" @click.stop="mobileCurrentTab='nav-info'">I</div>
      <div id="nav-spells" class="mobile-nav-button" @click.stop="mobileCurrentTab='nav-spells'">S</div>
    </div>
  </div>
</template>

<script>
import Monster from './components/Monster'
import Spellfinder from './components/Spellfinder'
import AddForm from './components/AddForm'
import SpellInfo from './components/SpellInfo'
import Info from './components/Info'
import diceRoller from './components/dice-roller'
import Xp from './components/Xp'
import Server from './server'
import MonsterClass from './monster'
import types from './monster-type.json'
import random from './random'
import parser from './parser'
import COLOR from './color-codes.json'
import SpellForm from './components/SpellForm'
import RoundCounter from './components/RoundCounter'

export default {
  name: 'app',
  mounted () {
    this.server.connect(this.user);
    this.server.fetchNames().then(data => {
      this.names = data;
      this.isNamesLoaded = true;
      this.server.fetchSpells().then(spellNames => {
        this.spellNames = spellNames;
        this.isSpellsLoaded = true;
      });
    });
  },
  data () {
    return {
      isNamesLoaded: false,
      isSpellsLoaded: false,
      server: Server,
      user: {
        state: 0,
        displayName: '',
        monsters: [],
        spells: [],
        uid: ''
      },
      names: [],
      spellNames: [],
      currentSpell: '',
      initiative: [],
      monsters: [],
      removedMonsters: [],
      types,
      random,
      selected: -1,
      hitSign: '-',
      hitMod: '',
      form: 0,
      showUserMenu: 0,
      round: {
        round: 1,
        order: 0,
        reset () {
          this.round = 1;
          this.order = 0;
        },
        next (limit) {
          this.order += 1;
          if (this.order >= limit) {
            this.order = 0;
            this.round += 1;
          }
        }
      },
      mobileCurrentTab: 'nav-list'
    }
  },
  computed: {
    mobileAppClass () {
      return {[this.mobileCurrentTab]: true}
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
      //if (!this.monsters[this.selected].key.length) return false;
      if (this.monsters[this.selected].name.length === 0) return false;

      return true;
    },
    monsterList () {
      if (!this.user.monsters.length) return this.names;
      if (!this.names.length) return this.user.monsters;

      let list = this.names.slice();

      for (let i = 0; i < this.user.monsters.length; i++) {
        for (let j = 0; j < this.names.length; j++) {
          if (this.user.monsters[i].name.toLowerCase() < this.names[j].name.toLowerCase()) {
            list.splice(j, 0, this.user.monsters[i]);
            break;
          }
          if (j === this.names.length - 1) list.push(this.user.monsters[i]);
        }
      }

      return list;
    },
    spellList () {
      if (!this.user.spells.length) return this.spellNames;
      if (!this.spellNames.length) return this.user.spells;

      let list = this.spellNames.slice();

      for (let i = 0; i < this.user.spells.length; i++) {
        for (let j = 0; j < this.spellNames.length; j++) {
          if (this.user.spells[i].name.toLowerCase() < this.spellNames[j].name.toLowerCase()) {
            list.splice(j, 0, this.user.spells[i]);
            break;
          }
          if (j === this.spellNames.length - 1) list.push(this.user.spells[i]);
        }
      }

      return list;
    },
    monsterName () {
      if (!this.showHits) return '';

      return this.monsters[this.selected].name;
    }
  },
  methods: {
    addMonster (monster = false) {
      if (!monster) {
        this.monsters.push(new MonsterClass());
      } else {
        this.monsters.push(monster);
      }
      let initiative = monster ? monster.initiative : 0;
      this.initiative.push(initiative);
      this.selected = this.monsters.length - 1;
    },
    selectItem (index) {
      this.selected = index;
    },
    resetXp () {
      this.removedMonsters = [];
    },
    loadPlayers (players) {
      players.forEach(player => {
        let i = this.monsters.findIndex(o => o.uid === player.uid);
        if (i === -1) {
          this.addMonster(player);
        } else {
          this.monsters.splice(i, 1, player);
          this.initiative.splice(i, 1, player.initiative);
        }
      });
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
            monster.name = `${name} ${i}`;

            if (COLOR.hasOwnProperty(i - 1)) monster.color = COLOR[i - 1];

            i++;
          }
        });
      });
    },
    nextOrder () {
      this.round.next(this.initiative.length);
      // select the current monster
      this.selectItem(this.round.order);
    },
    tab (index) {
      let next = index + 1;
      let inputs = document.getElementsByClassName('form-control');

      if (next < inputs.length) inputs[next].focus();
    },
    onMonsterRequest (index) {
      if (this.monsters.length - 1 > index) return this.tab(index);

      // if a monster is not found it is probably a player at this point
      let monster = this.monsters[index];
      if (!monster.key && monster.type === this.types.monster) {
        monster.type = this.types.character;
      }

      this.addMonster();
      this.$nextTick(() => { this.tab(index) });
    },
    onRemoveMonster (index) {
      this.selected = -1;
      let removedMonster = this.monsters.splice(index, 1)[0];
      this.initiative.splice(index, 1);

      if (removedMonster.type === this.types.monster && removedMonster.name.length) {
        this.addToRemoved(removedMonster);
      }
    },
    addToRemoved (monsterObject) {
      this.removedMonsters.push({
        name: monsterObject.name,
        key: monsterObject.key,
        xp: monsterObject.xp
      });
    },
    cancelRemoved (monsterObject) {
      const index = this.removedMonsters.findIndex(o => {
        if (monsterObject.key) return o.key === monsterObject.key;

        return o.name === monsterObject.name;
      });

      this.removedMonsters.splice(index, 1);
    },
    generateInitiative (force = false) {
      this.monsters.forEach((monster, i) => {
        if (monster.type === this.types.character) return;
        if (!force && this.initiative[i] > 0) return;

        this.random.get(20).then(data => {
          let mod = parseInt(monster.dex, 10);
          if (isNaN(mod)) mod = 0;

          this.initiative.splice(i, 1, data[0] + mod);
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
    },
    onRequestDiceRoll (event) {
      let monsters = [event.monster];

      if (event.all) monsters = this.monsters.filter(monster => monster.type === this.types.character);

      monsters.forEach(monster => this.makeMonsterRoll(monster, event.target));
    },
    makeMonsterRoll (monster, target) {
      if (!monster.meta.hasOwnProperty(target) || !monster.meta[target].length) return;

      let parseResult;
      try {
        parseResult = parser.parse(monster.meta[target], true);
      } catch (e) {
        console.error(e);
      }

      if (parseResult === undefined) return;

      Promise.all(parseResult.map(o => random.get(o.die, o.n)))
      .then(dataArray => {
        let result;

        if (parseResult[0].advantage && dataArray.length > 1) {
          result = dataArray[0][0] > dataArray[1][0] ? dataArray[0][0] : dataArray[1][0];
        } else if (parseResult[0].disadvantage && dataArray.length > 1) {
          result = dataArray[0][0] > dataArray[1][0] ? dataArray[1][0] : dataArray[0][0];
        } else if (dataArray.length > 0) {
          result = dataArray[0][0];
        }

        if (result !== undefined) {
          monster.meta[`r${target}`] = result + parseResult[0].modifier;
        }
      })
      .catch(e => {
        console.error(e);
        monster.meta[`r${target}`] = 'error';
      });
    }
  },
  components: {
    Monster,
    Info,
    diceRoller,
    Spellfinder,
    SpellInfo,
    AddForm,
    Xp,
    SpellForm,
    RoundCounter
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
::-webkit-scrollbar {
  display: none;
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
  margin-left: 10px;
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
  height: 100%;
  overflow: hidden;
}
.list-fix {
  height: 100%;
  overflow-y: scroll;
  width: 100%;
  padding-right: 17px;
  overscroll-behavior: contain;
}
.list,
.list-control {
  order: 0;
  flex: 0 0 320px;
  align-self: auto;
}
.list {
  height: calc(100vh - 53px);
  overflow: hidden;
}
.list-fix-wrapper {
  overflow: hidden;
  height: calc(100vh - 106px);
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
  flex: 1 0 0;
  align-self: auto;
  max-width: 500px;
}
.info {
  overflow-y: scroll;
  height: 100%;
  overscroll-behavior: contain;
}
.monster-stat,
.character-meta {
  text-align: left;
  padding: 30px 25px;
  > div:first-of-type {
    border-bottom: 1px solid;
    margin-bottom: 20px;
  }
}
.character-heading {
  text-align: left;
  h3 {
    margin-top: 0;
  }
}
.selected .monster-input-wrapper {
  background: #ececec;
}
.monster-input-wrapper {
  height: 32px;
  overflow: hidden;
  transition: background-color .4s;
  .name-counter {
    height: 20px;
    transition: all .4s;
    &:focus-within {
      height: 32px;
    }
  }
  .name-counter .form-control:focus {
    height: 32px;
    font-size: 16px;
  }
}
.character-meta-info {
  height: 12px;
  overflow: hidden;
  font-size: 11px;
  font-style: italic;
  transition: all .4s;
  text-align: left;
  span {
    margin-left: 4px;
  }
}
.expanded {
  .name-counter .form-control {
    height: 20px;
    font-size: 14px;
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
  flex: 1 0 0;
  align-self: auto;
  text-align: left;
  position: relative;
  box-sizing: border-box;
  .dropdown-menu {
    text-align: center;
  }
  border-left: 1px solid #ebebeb;
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
  box-sizing: border-box;
  max-width: 500px;
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
.character-meta {
  .form-control {
    width: 90%;
    input {
      margin: 0 10px;
      width: 60px;
    }
    label {
      display: inline-block;
      width: 35%;
    }
    .control-button {
      vertical-align: middle;
      margin-left: 0;
    }
  }
}
.delete-button {
  height: 32px;
  width: 26px;
  font-size: 24px;
  color: #fff;
  line-height: 32px;
  background: #aac;
  flex: 1 1 auto;
  cursor: pointer;
  text-align: center;
  transition: background-color .4s;
  &:hover {
    background: #ca331a;
  }
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
}
.initiative-counter {
  position: relative;
  overflow: hidden;
  &:before {
    display: none;
    content: '';
    width: 10px;
    height: 10px;
    transform: rotate(45deg);
    background: #fff;
    position: absolute;
    top: 10px;
    left: -5px;
  }
}
.turn {
  .initiative {
    background: #ecac22;
  }
  /*.initiative-counter:before {
    display: block;
  }*/
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
  padding-bottom: 8px;
  padding-left: 70px;
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
    display: none;
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
  &:hover .user-menu {
    display: block;
  }
}
.tips {
  h1 {
    font-size: 24px;
  }
  p {
    font-weight: bold;
    text-align: left;
    padding-left: 15px;
  }
  ul {
    margin-right: 15px;
    padding-left: 30px;
  }
  li {
    text-align: left;
    font-size: 12px;
    color: #999;
    margin-bottom: 10px;
  }
}
.icon-loader {
  margin-left: 15px;
}
.s-loader {
  margin-left: 5px;
  font-size: 12px;
  margin-top: 9px;
}
.spell-control {
  .icon-loader {
    margin-left: 0;
    margin-top: 10px;
    vertical-align: middle;
  }
  .s-loader {
    margin-top: 0;
  }
}
.dice-tips li {
  color: #2c3e50;
}
.disabled {
  opacity: .5;
  cursor: disabled;
}
@keyframes bounce{
  0% {
    transform:  translate(0px,0px)  ;
  }
  15% {
    transform:  translate(0px,-25px)  ;
  }
  30% {
    transform:  translate(0px,0px)  ;
  }
  45% {
    transform:  translate(0px,-15px)  ;
  }
  60% {
    transform:  translate(0px,0px)  ;
  }
  75% {
    transform:  translate(0px,-5px)  ;
  }
  100% {
    transform:  translate(0px,0px)  ;
  }
}
.saved {
  animation: bounce linear 0.8s;
  animation-iteration-count: 1;
  transform-origin: 50% 50%;
}
.mobile-nav {
  display: none;
}
@media (max-width:375px) {
  body {
    width: 100%;
    overflow-x: hidden;
  }
  .list, .list-control {
    flex-basis: 100vw;
  }
  .list-fix-wrapper {
    width: 100vw;
  }
  #app .name-counter .form-control {
    width: 100%;
  }
  #app {
    .monster-input-wrapper {
      flex: 1 0 auto;
    }
  }
  .monster-container,
  .controls {
    transition: transform .4s ease-in-out;
  }
  #app.nav-list {
    #nav-list {background: #ebebeb;}
  }
  #app.nav-info {
    .controls,
    .monster-container {
      transform: translateX(-100vw);
    }
    #nav-info{background: #ebebeb;}
  }
  #app.nav-spells {
    .controls,
    .monster-container {
      transform: translateX(-200vw);
    }
    #nav-spells{background: #ebebeb;}
  }
  .controls {
    right: auto;
  }
  .list .xp-tracker {
    transform: translateY(100vh);
  }
  .mobile-nav {
    position: fixed;
    background: #fff;
    width: 100%;
    bottom: 0;
    left: 0;
    height: 53px;
    border-top: 1px solid #ebebeb;
    display: flex;
    flex-wrap: nowrap;
    justify-content: center;
    .mobile-nav-button {
      flex: 1 1 auto;
      line-height: 53px;
      transition: all .4s ease-in-out;
      border-right: 1px solid #ebebeb;
      &.active {
        background: #ebebeb;
      }
      &:last-child {
        border-right: none;
      }
    }
  }
  .list-control,
  .combat-control,
  .spell-control {
    width: 100vw;
    max-width: 100vw;
  }
  .combat-control {
    justify-content: space-between;
    .dice-result {
      margin-right: 10px;
    }
    .dice-wrapper {
      margin-left: 5px;
    }
  }
  .info, .spell-stat {
    max-width: 100vw !important;
  }
  .spell-stat {
    flex: 1 0 auto !important;
  }
}
</style>
