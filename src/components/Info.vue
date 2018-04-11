<template>
  <div class="stat-wrapper">
    <div class="monster-stat" v-html="monster.info" v-show="TYPES.monster == monster.type"></div>
    <div class="character-meta" v-show="TYPES.character == monster.type">
      <div class="character-heading">
        <h3 class="f-s-24 f-w-b">{{monster.name}}</h3>
      </div>
      <div class="character-body">
        <div class="form-control">
          <label>AC</label><input v-model.trim="monster.meta.ac">
        </div>
        <div class="form-control">
          <label>Stealth</label><input v-model.trim="monster.meta.stealth">
          <a href="#" class="control-button"><img src="../assets/init.png" class="icon"></a>
        </div>
        <div class="form-control">
          <label>Perception</label><input v-model.trim="monster.meta.perception">
        </div>
        <div class="form-control">
          <p>Notes</p><textarea rows="20" cols="55" v-model="monster.meta.notes"></textarea>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Server from '../server'
import TYPES from '../monster-type.json'

export default {
  props: ['monster', 'id'],
  data () {
    return { TYPES }
  },
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

