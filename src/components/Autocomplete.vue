<template>
  <div class="name-counter" v-bind:class="{'open':openSuggestion}">
    <input class="form-control" type="text" :value="input" @input.stop="updateValue($event.target.value)"
      @keydown.enter = 'enter'
      @keydown.down = 'down'
      @keydown.up = 'up'
      @keydown.esc = 'cancel'
      @keydown.tab.prevent = 'newMonster'
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
  props: ['suggestions', 'value', 'index'],
  mounted () {
    //this is workaround for a bug where old values
    //persist in items after array was changed
    this.$parent.$on('item-removed', this.fixInput);
    this.$parent.$on('items-sorted', this.fixInput);
  },
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
      if (!this.matches.length) return;
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
    },

    fixInput (names) {
      if (this.index >= names.length) return;

      this.input = names[this.index].name;
    },

    newMonster () {
      this.$emit('monsterRequest', this.index);
    }
  }
}
</script>

