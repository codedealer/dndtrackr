<template>
  <Autocomplete :suggestions="names" v-model="selection"></Autocomplete>
</template>

<script>
import Autocomplete from './Autocomplete'
export default {
  props: ['names'],
  data () {
    return {
      selection: -1
    }
  },
  components: {
    Autocomplete
  }
}
</script>
