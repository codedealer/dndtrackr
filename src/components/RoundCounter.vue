<template>
  <div class="round-counter">
    <label class="round-counter-label">{{round.round}}</label>
    <div class="control-next" @click.stop="$emit('nextOrder')" title="next turn"></div>
    <div class="control-reset" @click.stop="round.reset" title="reset combat"></div>
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
  display: inline-block;
  width: 32px;
  height: 32px;
  background-color:  $accent;
  background-repeat: no-repeat;
  background-position: center;
  background-image: url(../assets/next.png);
  cursor: pointer;
  transition: background-color .4s ease-in-out;
  &:hover {
    background-color: $tertiary;
  }
}
.control-reset {
  @extend .control-next;
  background-image: url(../assets/reset.png);
}
</style>