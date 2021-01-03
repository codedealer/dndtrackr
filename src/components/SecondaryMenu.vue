<template>
  <v-menu
    offset-y
    :close-on-content-click="true"
    transition="slide-y-transition"
  >
    <template #activator="{ on, attrs }">
      <v-btn
        fab
        depressed
        height="48" width="48"
        color="btnColor"
        v-on="on"
        v-bind="attrs"
        class="mr-2"
      >
        <v-icon>mdi-dots-horizontal</v-icon>
      </v-btn>
    </template>

    <v-list>
      <v-list-item-group
        v-model="m"
        active-class=""
      >
        <v-list-item value="SpellInfo">
          <v-list-item-content>
            <v-list-item-title>Spells</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item :disabled="!user.state" value="UserActors">
          <v-list-item-content>
            <v-list-item-title>User Actors</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item :disabled="!user.state" value="UserSpells">
          <v-list-item-content>
            <v-list-item-title>User Spells</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-list>

  </v-menu>
</template>

<script>
export default {
  data: () => ({
    state: false,
  }),

  computed: {
    m: {
      get () { return this.$store.state.secondaryMenu },
      set (value) {
        this.$store.commit('SET_MENU', value);
      }
    },
    user () { return this.$store.state.user },
  },
}
</script>