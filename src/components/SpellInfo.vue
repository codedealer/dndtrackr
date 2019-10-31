<template>
  <div class="spell-stat">
    <div class="spell-stat-inner" v-html="info.description"></div>
  </div>
</template>
<script>
import Server from '../server'

export default {
  props: ['id'],
  data () {
    return {
      info: ''
    }
  },
  watch: {
    id (newId) {
      if (!newId.length) return;

      Server.getSpellData(newId).then(data => {
        this.info = data;
      });
    }
  }
}
</script>

<style lang="scss">
$tertiary: #5f5f71;
.spell-stat {
  overflow-y: scroll;
  height: 100%;
  overscroll-behavior: contain;
  order: 0;
  flex: 1 0 0;
  max-width: 500px;
  background: $tertiary;
  align-self: auto;
  text-align: left;
  padding: 30px 0;
  width: 100%;
  box-sizing: border-box;
  .m-t-10 div {
    column-count: 1 !important;
    width: 100% !important;
  }
  .p-b-20 {
    padding-bottom: 20px;
  }
}
.spell-stat-inner {
  padding: 0 25px;
}
</style>
