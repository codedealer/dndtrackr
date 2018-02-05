<template>
  <div class="control-item control-flex-item">
    <div class="dice-wrapper">
      <input v-model.trim="dice" placeholder="2(1d20 + 3)" class="dice-roller-input" @keydown.enter.self="roll">
    </div>
    <div class="dice-result" @click.stop="expand">
      {{resultTotal}}
      <div class="dice-detector" v-show="detected">{{nat}}</div>
    </div>
    <expander :resultArray="result" v-show="showExpander"></expander>
  </div>
</template>

<script>
import random from '../random'
import parser from '../parser'
import expander from './expander'

export default {
  data () {
    return {
      dice: '',
      result: [],
      showExpander: false
    }
  },
  computed: {
    resultTotal () {
      if (!this.result.length) return 0;

      if (this.result[0].diceParams.advantage || this.result[0].diceParams.disadvantage) return this.compare();

      return this.result.reduce((prev, cur) => {
        return prev + cur.data.reduce((p, c) => p + c, 0) + cur.diceParams.modifier;
      }, 0);
    },
    detected () {
      if (!this.result.length) return false;
      if (this.result[0].diceParams.die !== 20) return false;
      if (this.result[0].diceParams.advantage || this.result[0].diceParams.disadvantage) return true;

      return this.result.some(res => {
        return res.data.some(el => el === 20 || el === 1);
      });
    },
    nat () {
      if (!this.detected) return 0;
      let res, nat;

      if (this.result[0].diceParams.advantage) res = 'adv';
      if (this.result[0].diceParams.disadvantage) res = 'd/adv';

      if (res !== undefined) {
        nat = this.compare() - this.result[0].diceParams.modifier;
        if (nat === 20 || nat === 1) res = `nat ${nat}`;
      } else {
        for (var i = this.result.length - 1; i >= 0; i--) {
          nat = this.result[i].data.find(el => el === 20 || el === 1);
          if (nat !== undefined) res = `nat ${nat}`;
        }
      }

      return res;
    }
  },
  methods: {
    roll () {
      if (!this.dice.length) return;
      let diceParams;

      try {
        diceParams = parser.parse(this.dice, true);
      } catch (e) {
        console.error(e);
        this.dice = 'error';
        return;
      }

      Promise.all(diceParams.map(o => random.get(o.die, o.n)))
        .then(dataArray => {
          this.result = [];
          for (let i = 0; i < dataArray.length; i++) {
            this.result.push({
              data: dataArray[i],
              diceParams: diceParams[i]
            });
          }
          this.dice = '';
        })
        .catch(e => {
          console.error(e);
          this.dice = 'error';
        });
    },
    compare () {
      const first = this.result[0].data[0] + this.result[0].diceParams.modifier;
      const last = this.result[1].data[0] + this.result[1].diceParams.modifier;
      if (this.result[0].diceParams.advantage) {
        return first > last ? first : last;
      } else {
        return first > last ? last : first;
      }
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
  width: 110px;
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
