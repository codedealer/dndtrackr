<template>
  <div class="spell-finder" v-bind:class="{'open':openSuggestion}">
    <input class="ordinary-input" type="text"
      placeholder="Spells"
      :value="input"
      @input.stop="updateValue($event.target.value)"
      @keydown.enter = 'enter'
      @keydown.down = 'down'
      @keydown.up = 'up'
      @keydown.esc = 'cancel'
    >
    <ul class="dropdown-menu">
        <li v-for="(suggestion, index) in matches"
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
  props: ['suggestions', 'value'],
  data () {
    return {
      open: false,
      current: 0,
      input: ''
    }
  },
  computed: {
    matches () {
      return this.suggestions.filter(obj => {
        return obj.name.toLowerCase().indexOf(this.input.toLowerCase()) >= 0;
      });
    },
    openSuggestion () {
      return this.selection !== '' &&
             this.matches.length !== 0 &&
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
      this.input = value;
    },

    // When enter key pressed on the input
    enter () {
      this.$emit('input', this.matches[this.current].key);
      this.input = this.matches[this.current].name;
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
      if (this.current < this.matches.length - 1) {
        this.current++
      }
    },

    // For highlighting element
    isActive (index) {
      return index === this.current
    },

    // When one of the suggestion is clicked
    suggestionClick (index) {
      this.$emit('input', this.matches[index].key);
      this.input = this.matches[index].name;
      this.open = false;
    }
  }
}
</script>
<style lang="scss">
.spell-finder {
  position: relative;
  display: inline-block;
  padding-left: 25px;
}
</style>
