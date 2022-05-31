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
        v-for="(obj, key) in menuObject"
        :key="key"
      >
        <v-list-item
          :value="obj.component"
          :disabled="obj.loginRequired ? !user.state : false"
        >
          <v-list-item-content>
            <v-list-item-title>{{ obj.name }}</v-list-item-title>
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
    menuObject () { return this.$store.state.secondaryMenuObject }
  },
}
</script>