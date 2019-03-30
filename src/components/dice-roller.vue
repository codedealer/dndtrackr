<template>
  <div class="control-item control-flex-item">
    <div class="dice-wrapper">
      <input v-model.trim="dice" placeholder="1d20 + 2d4 + 3" class="dice-roller-input" @keydown.enter.self="roll"
      @keydown.up.self.prevent="prevRoll"
      @keydown.down.self.prevent="nextRoll">
    </div>
    <div class="dice-result" @click.stop="expand">
      {{resultTotal}}
      <div class="dice-detector" v-show="nat.length">{{nat}}</div>
    </div>
    <expander :result="result" v-show="showExpander"></expander>
  </div>
</template>

<script>
import random from '../random'
import parser from '../parser'
import expander from './expander'
import history from '../roll_history'

export default {
  data () {
    return {
      dice: '',
      result: {diceRolls: [{}, {}], diceParams: {}},
      history,
      showExpander: false
    }
  },
  computed: {
    resultTotal () {
      if (Object.entries(this.result.diceParams).length === 0) return 0;

      let total1 = this.result.diceParams.eval(this.result.diceRolls[0]);

      if (this.result.diceParams.advantage || this.result.diceParams.disadvantage) {
        let total2 = this.result.diceParams.eval(this.result.diceRolls[1]);

        return this.result.diceParams.advantage ? Math.max(total1, total2) : Math.min(total1, total2);
      }

      return total1;
    },
    nat () {
      if (Object.entries(this.result.diceParams).length === 0) return 0;
      let res = '';

      if (this.result.diceParams.advantage) res = 'adv';
      if (this.result.diceParams.disadvantage) res = 'd/adv';

      Object.entries(this.result.diceParams.dice).find(kvPair => {
        if (kvPair[1].die !== 20 || kvPair[1].n !== 1) return false;

        let nat = this.result.diceRolls[0][kvPair[0]];
        if (nat === '20' || nat === '1') {
          res = `nat ${nat}`;
          return true;
        }

        if (res !== undefined) {
          nat = this.result.diceRolls[1][kvPair[0]];
          if (nat === '20' || nat === '1') {
            res = `nat ${nat}`;
            return true;
          }
        }

        return false;
      });

      return res;
    }
  },
  methods: {
    roll () {
      if (!this.dice.length) return;
      let diceParams;
      const str = this.dice;

      try {
        diceParams = parser.parse(this.dice, true);
      } catch (e) {
        console.error(e);
        this.dice = 'error';
        return;
      }

      let diceRolls = [{}, {}];
      let isDoubleRoll = diceParams.advantage || diceParams.disadvantage;

      let promises = [];
      Object.entries(diceParams.dice).forEach(kvPair => {
        let promise = random.get(kvPair[1].die, kvPair[1].n).then((data) => {
          diceRolls[0][kvPair[0]] = data.join(' + ');
        });
        promises.push(promise);
        if (isDoubleRoll) {
          promise = random.get(kvPair[1].die, kvPair[1].n).then((data) => {
            diceRolls[1][kvPair[0]] = data.join(' + ');
          });
          promises.push(promise);
        }
      });

      Promise.all(promises)
      .then(() => {
        this.result = {diceRolls, diceParams};
        this.history.push({str, result: this.result});
        this.dice = '';
      })
      .catch(e => {
        console.error(e);
        this.dice = 'error';
      })
      ;
    },
    prevRoll () {
      const roll = this.history.prev();
      if (roll === false) return;

      this.dice = roll.str;
      this.result = roll.result;
    },
    nextRoll () {
      const roll = this.history.next();
      if (roll === false) {
        this.dice = '';
        this.result = {diceParams: {}, diceRolls: [{}, {}]};
        return;
      }

      this.dice = roll.str;
      this.result = roll.result;
    },
    expand () {
      this.showExpander = !this.showExpander;
    }
  },
  components: {
    expander
  }
}
</script>

<style lang="scss">
.dice-roller-input {
  font-size: 16px;
  width: 140px;
  margin-top: 8px;
}
.dice-result {
  width: 42px;
  height: 42px;
  margin-left: 10px;
  text-align: center;
  font-size: 18px;
  line-height: 42px;
  border-radius: 50%;
  background: #aac;
  cursor: pointer;
  position: relative;
  .dice-detector {
    position: absolute;
    bottom: -11px;
    left: 0;
    right: 0;
    font-weight: bold;
    text-align: center;
    font-size: 10px;
    color: #ee4320;
  }
}
.dice-result,
.dice-wrapper {
  flex: 0 1 auto;
  align-self: auto;
}
.control-flex-item {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: space-between;
  position: relative;
}
</style>
