<template>
  <div class="actor-status-container">
    <div class="actor-status-list">
      <StatusButton
        v-for="(status, i) in barStatuses"
        :key="status.uid"
        :actor="actor"
        :index="index"
        :statusIndex="i"
        :status="status"
        v-slot="{ attrs, tooltip, menu }"
      >
        <v-chip
          :close="status.deletable"
          @click:close="deleteStatus(i)"
          class="px-1 mr-1 status-pill"
          label
          small
          filter
          :class="status.deletable ? 'primary lighten-1' : ''"
          :input-value="status.icon.length > 0"
          :filter-icon="status.icon"
          v-bind="attrs"
          v-on="{ ...tooltip, ...menu }"
        >{{ status.name }}</v-chip>
      </StatusButton>
    </div>
    <StatusButton
      :actor="actor"
      :index="index"
      :showDelete="true"
      v-slot="{ attrs, tooltip, menu }"
    >
      <v-btn
        height="23"
        width="23"
        min-width="23"
        tile
        depressed
        icon
        transition="slide-x-transition"
        v-bind="attrs"
        v-on="{ ...tooltip, ...menu }"
      ><v-icon small>mdi-plus</v-icon></v-btn>
    </StatusButton>
  </div>
</template>

<script>
import StatusButton from './StatusButton';
import StatusMixin from '../utils/statusMixin';

export default {
  mixins: [StatusMixin],
  props: ['actor', 'index'],

  data: () => ({}),

  computed: {
    barStatuses () {
      return this.actor.status.filter(s => s.showInBar);
    }
  },

  components: {
    StatusButton,
  }
}
</script>

<style lang="scss">
.actor-status-container {
  height: 23px;
  display: flex;
}
.actor-status-list {
  overflow: hidden;
  display: flex;
  flex: 1;
  flex-wrap: nowrap;
}
.status-pill {
  height: 23px !important;
  flex: 0 0 auto;
  cursor: pointer;
  .v-icon.v-chip__filter {
    font-size: 15px;
    margin-left: 0;
    margin-right: 3px;
  }
}
.status-icon-selector.v-text-field.v-text-field--enclosed {
  max-width: 120px;
  margin-top: -8px;
}
.actor-status-name {
  > .v-input__control {
    max-width: 150px;
  }
}
</style>