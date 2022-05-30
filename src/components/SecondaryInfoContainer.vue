<template>
  <keep-alive>
    <component v-bind:is="currentPanel"></component>
  </keep-alive>
</template>

<script>
import SpellInfo from './SpellInfo';
import UserActors from './UserActors';
import UserSpells from './UserSpells';
import UserFeats from './UserFeats';

export default {
  data: () => ({}),

  computed: {
    currentPanel () { return this.$store.state.secondaryMenu },
  },

  components: {
    SpellInfo,
    UserSpells,
    UserActors,
    UserFeats,
  }
}
</script>