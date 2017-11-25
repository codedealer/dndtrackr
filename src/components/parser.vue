<template>
  <a href="#" class="control-button" @click.prevent="parseHealth" title="rename monster duplicates">P</a>
</template>

<script>
import Server from '../server'

export default {
  data () {
    return {
      server: Server
    }
  },
  methods: {
    parseHealth () {
      this.server.parseHealth();
    }
  }
}
</script>
