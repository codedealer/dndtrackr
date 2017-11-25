<template>
  <div class="result-expander">
    <div class="single-result" v-for="(result, i) in resultArray">
      <div class="die" v-for="(die, index) in result.data">
        <span class="die-num">{{die}}</span>
        <span class="die-plus" v-show="index !== result.data.length - 1"> + </span>
      </div>
      <span v-if="showMod(i)">{{prettyModifier(i)}}</span>
      <div class="total" v-show="result.data.length"> = <span>{{total(i)}}</span></div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['resultArray'],
  methods: {
    prettyModifier (index) {
      let str = '' + this.resultArray[index].diceParams.modifier;

      if (str[0] === '-') {
        str = str.split('');
        str.splice(1, 0, ' ');
        return str.join('');
      }

      return '+ ' + str;
    },
    showMod (index) {
      return this.resultArray[index].diceParams.modifier !== 0;
    },
    total (index) {
      return this.resultArray[index].data.reduce((p, c) => p + c) + this.resultArray[index].diceParams.modifier;
    }
  }
}
</script>

<style lang="scss">
.die {
  .die-num {
    background: #aac;
    margin-left: 3px;
    padding: 0 2px;
  }
  .die-plus {
    background: #fff;
  }
}
.total span {
  font-size: 18px;
  font-weight: bold;
}
.result-expander {
  position: absolute;
  top: 42px;
  box-shadow: 0 0px 3px rgba(0,0,0,0.3);
  left: 0;
  width: 166px;
  padding: 10px;
  max-height: 180px;
  background: #fff;
  z-index: 101;
  &:after {
    content: '';
    display: block;
    width: 10px;
    height: 10px;
    background: #fff;
    transform: rotate(45deg);
    position: absolute;
    top: -5px;
    right: 33px;
  }
}
.die, .total {
  display: inline-block;
}
.single-result {
  border-bottom: 1px solid #ebebeb;
  padding-bottom: 3px;
  &:last-of-type {
    border-bottom: none;
    padding-bottom: 0;
  }
}
</style>
