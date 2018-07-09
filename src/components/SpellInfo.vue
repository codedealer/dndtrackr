<template>
  <div class="spell-stat" v-html="info.description"></div>
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
.spell-stat {
  order: 0;
  flex: 1 100 auto;
  max-width: 500px;
  background: #aac;
  align-self: auto;
  text-align: left;
  padding: 30px 25px;
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
</style>
