<template>
  <div class="actor-input-container autocomplete-container">
    <input
      class="actor-input"
      :value="value"
      @input="onInput($event.target.value)"
      @keydown.up = 'up'
      @keydown.down = 'down'
      @keydown.esc = 'cancel'
      @keydown.enter = 'enter'
      @keydown.tab.prevent = 'traverse'
    >
    <ul class="autocomplete-list" :ref="'dropdownContainer'" v-show="isOpened">
      <li
        v-for="(item, index) in match"
        class="autocomplete-list-item"
        :class="{ active: index === cursor }"
        :ref="`item-${index}`"
        @click.stop="choose(index)"
      >
        <div class="autocomplete-item-title">{{ item.name }}</div>
        <div class="autocomplete-item-subtitle">
          <v-chip x-small class="mr-1" color="purple darken-4">{{ item.type }}</v-chip>
          <v-chip x-small class="mr-1" color="red darken-3">CR {{ item.challenge_rating }}</v-chip>
          <v-chip x-small>{{ sourceIcon(item.tag) }}</v-chip>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import sourceParser from '../utils/sourceParser';
import goTo from 'vuetify/es5/services/goto';

export default {
  mixins: [sourceParser],
  props: ['value', 'list'],

  data: () => ({
    open: false,
    cursor: 0
  }),

  computed: {
    isOpened () {
      return this.value !== '' &&
             this.open;
    },
    match () {
      this.cursor = 0;
      let match = this.list.filter(obj => {
        return obj.name.toLowerCase().indexOf(this.value.toLowerCase()) >= 0;
      });

      match.sort((a, b) => {
        let names = a.name.toLowerCase().split(' ');
        let bnames = b.name.toLowerCase().split(' ');
        let amatch = names.find(name => name.indexOf(this.value.toLowerCase()) === 0);
        let bmatch = bnames.find(name => name.indexOf(this.value.toLowerCase()) === 0);

        if (amatch !== undefined) {
          // some words in a match
          if (bmatch !== undefined) {
            // some words in b also match
            if (a.name.toLowerCase().indexOf(this.value.toLowerCase()) === 0) {
              // a starts with value
              if (b.name.toLowerCase().indexOf(this.value.toLowerCase()) === 0) {
                // b also does
                return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
              }

              return -1;
            }

            return amatch.toLowerCase() < bmatch.toLowerCase() ? -1 : 1;
          }

          return -1;
        } else {
          if (bmatch !== undefined) {
            return 1;
          }

          return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
        }
      });

      return match.slice(0, 30);
    }
  },

  methods: {
    onInput (value) {
      if (value.length > 1) {
        this.cursor = 0;
        this.open = true;
        this.scroll();
      } else {
        this.open = false;
      }

      this.$emit('input', value);
    },
    cancel () {
      this.cursor = 0;
      this.open = false;
    },
    scroll () {
      if (!this.$refs[`item-${this.cursor}`] || !this.$refs[`item-${this.cursor}`].length) return;
      goTo(this.$refs[`item-${this.cursor}`][0], {
        container: this.$refs['dropdownContainer'],
        offset: 0,
      });
    },
    up () {
      if (!this.isOpened) return false;
      if (this.cursor > 0) {
        this.cursor--;
        this.scroll();
      }
    },
    down (e) {
      if (!this.isOpened) return false;
      if (this.cursor < this.match.length - 1) {
        this.cursor++;
        this.scroll();
      }
    },
    enter () {
      if (!this.match.length || !this.isOpened) return;
      this.open = false;
      this.$emit('newKey', this.match[this.cursor].key);
      this.$emit('input', this.match[this.cursor].name);
      this.cursor = 0;
    },
    choose (index) {
      this.open = false;
      this.$emit('newKey', this.match[index].key);
      this.$emit('input', this.match[index].name);
    },
    traverse () {
      this.enter(); // auto approve the current suggestion
      this.$emit('traverse');
    }
  }
}
</script>

<style lang="scss">
.autocomplete-container {
  position: relative;
  .autocomplete-list {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    max-height: 240px;
    padding: 0;
    list-style: none;
    overflow-x: hidden;
    overflow-y: auto;
    margin: 0;
    z-index: 100;
    box-shadow: 0 4px 4px rgba(0, 0, 0, .3);
    background: #eee;
    color: #323232;
    &::-webkit-scrollbar {
      display: none;
    }
  }
  .autocomplete-list-item {
    border-bottom: 1px solid rgba(0, 0, 0, .3);
    padding: 5px 5px 0;
    cursor: pointer;
    transition: background-color .2s ease-in-out;
    &:hover,
    &.active {
      background: rgba(0, 0, 0, 0.12);
    }
  }
  .autocomplete-item-title {
    line-height: 20px;
    padding-left: 3px;
  }
  .autocomplete-item-subtitle {
    margin-bottom: 3px;
  }
}
</style>