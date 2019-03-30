<template>
  <div class="result-expander">
    <div class="single-result" v-if="showResult">
      <div class="result-expression">{{result.diceParams.represent(result.diceRolls[0])}} = <span class="total">{{result.diceParams.eval(result.diceRolls[0])}}</span></div>
    </div>
    <div class="single-result" v-if="showResult && (result.diceParams.advantage || result.diceParams.disadvantage)">
      <div class="result-expression">{{result.diceParams.represent(result.diceRolls[1])}} = <span class="total">{{result.diceParams.eval(result.diceRolls[1])}}</span></div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['result'],
  computed: {
    showResult () {
      return Object.entries(this.result.diceRolls[0]).length > 0;
    }
  }
}
</script>

<style lang="scss">
.total {
  font-size: 18px;
  font-weight: bold;
}
.result-expander {
  font-size: 15px;
  position: absolute;
  top: 42px;
  filter: drop-shadow(0 0px 6px rgba(0,0,0,0.3));
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
    right: 7px;
  }
}
.single-result {
  border-bottom: 1px solid #ebebeb;
  padding: 3px 0;
  margin-bottom: 3px;
  &:last-of-type {
    border-bottom: none;
    margin-bottom: 0;
  }
}
</style>
