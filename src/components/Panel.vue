<template>
  <v-col class="app-panel">
    <div class="app-panel-content">
      <slot></slot>
    </div>
  </v-col>
</template>

<script>
export default {
  data: () => ({}),
}
</script>

<style lang="scss">
.app-panel {
  height: 100%;
  max-height: calc(100vh - 64px);
  overflow-y: auto;
  overscroll-behavior: contain;
  &::-webkit-scrollbar {
    display: none;
  }
}
.col {
  max-width: 550px;
}
</style>