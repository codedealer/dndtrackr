<template>
  <div class="round-counter">
    <label class="round-counter-label">{{round.round}}</label>
    <div class="control-next" @click.stop="$emit('nextOrder')" title="next turn">
      <img src="../assets/icon-next.svg" class="icon next">
    </div>
    <div class="control-reset" @click.stop="round.reset" title="reset combat">
      <img src="../assets/icon-reset.svg" class="icon">
    </div>
  </div>
</template>

<script>
export default {
  props: ['round'],
  data () {
    return {

    }
  }
}
</script>

<style lang="scss">
@import '../assets/var';

.round-counter {
  display: inline-flex;
  margin-left: 25px;
}
.round-counter-label {
  background: $tertiary;
  height: 32px;
  width: 32px;
  display: inline-block;
  line-height: 32px;
  text-align: center;
  font-size: 18px;
}
.control-next {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background-color:  $accent;
  cursor: pointer;
  transition: background-color .2s ease-in-out;
  &:hover {
    background-color: $tertiary;
  }
}
.next {
  width: 22px;
  height: 22px;
}
.control-reset {
  @extend .control-next;
}
</style>