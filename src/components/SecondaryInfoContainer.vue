<template>
  <keep-alive>
    <component v-bind:is="currentPanel"></component>
  </keep-alive>
</template>

<script>
import SpellInfo from './SpellInfo';
import UserActors from './UserActors';
import UserSpells from './UserSpells';

export default {
  data: () => ({}),

  computed: {
    currentPanel () { return this.$store.state.secondaryMenu },
  },

  components: {
    SpellInfo,
    UserSpells,
    UserActors,
  }
}
</script>