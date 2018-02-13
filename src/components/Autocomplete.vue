<template>
  <div class="name-counter" v-bind:class="{'open':openSuggestion}">
    <input ref="input" class="form-control" type="text" :value="value" @input.stop="updateValue($event.target.value)"
      @keydown.enter = 'enter'
      @keydown.down = 'down'
      @keydown.up = 'up'
      @keydown.esc = 'cancel'
      @keydown.tab.prevent = 'newMonster'
    >
    <ul class="dropdown-menu">
        <li v-for="(suggestion, index) in match"
            v-bind:class="{'active': isActive(index)}"
            @click.stop="suggestionClick(index)"
            class="pointer"
        >
          {{ suggestion.name }}
        </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: ['suggestions', 'value', 'index'],
  data () {
    return {
      open: false,
      current: 0
    }
  },
  computed: {
    match () {
      this.current = 0;
      let match = this.suggestions.filter(obj => {
        return obj.name.toLowerCase().indexOf(this.value.toLowerCase()) >= 0;
      });

      return match.sort((a, b) => {
        let names = a.name.toLowerCase().split(' ');
        let bnames = b.name.toLowerCase().split(' ');
        let amatch = names.find(name => name.indexOf(this.value.toLowerCase()) === 0);
        let bmatch = bnames.find(name => name.indexOf(this.value.toLowerCase()) === 0);

        if (amatch !== undefined) {
          if (bmatch !== undefined) {
            return amatch.toLowerCase() < bmatch.toLowerCase() ? -1 : 1;
          }

          return -1;
        } else {
          if (bnames.some(name => name.indexOf(this.value.toLowerCase()) === 0)) {
            return 1;
          }

          return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
        }
      });
    },
    openSuggestion () {
      return this.value !== '' &&
             this.match.length !== 0 &&
             this.open === true;
    }
  },
  methods: {
    // Triggered the input event to cascade the updates to
    // parent component
    updateValue (value) {
      if (this.open === false) {
        this.open = true
        this.current = 0
      }
      this.$emit('input', value);
    },

    // When enter key pressed on the input
    enter () {
      if (!this.match.length) return;
      this.$emit('input', this.match[this.current].name);
      this.$emit('monsterKey', this.match[this.current].key);
      //this.$refs.input.value = this.match[this.current].name;
      this.open = false;
    },

    // When up arrow pressed while suggestions are open
    up () {
      if (this.current > 0) {
        this.current--
      }
    },

    cancel () {
      this.current = 0;
      this.open = false;
    },

    // When down arrow pressed while suggestions are open
    down () {
      if (this.current < this.match.length - 1) {
        this.current++
      }
    },

    // For highlighting element
    isActive (index) {
      return index === this.current
    },

    // When one of the suggestion is clicked
    suggestionClick (index) {
      this.$emit('input', this.match[index].name);
      this.$emit('monsterKey', this.match[index].key);
      this.open = false;
    },

    newMonster () {
      this.current = 0;
      this.open = false;
      this.$emit('monsterRequest', this.index);
    }
  }
}
</script>

<style lang="scss">
.name-counter .form-control {
  width: 200px;
  margin: 0;
  height: 32px;
  border: none;
  outline: none;
  font-size: 16px;
  box-sizing: border-box;
  transition: background-color .3s;
  &:focus {
    background: #ececec;
  }
}
</style>
