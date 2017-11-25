<template>
  <div class="monster-stat" v-html="monster.info"></div>
</template>
<script>
import Server from '../server'

export default {
  props: ['monster', 'id'],
  watch: {
    id (newId) {
      if (!newId.length) return;

      Server.getMonsterData(newId).then(data => {
        this.monster.setData(data);
      });
    }
  }
}
</script>

