<template>
  <div class="xp-tracker" :class="{'expanded': expanded}">
    <div class="xp-header" @click="expanded = !expanded">
      <div class="xp-controls"></div>
      <div class="xp-counter">
        <div class="xp-counter-total">{{total}} XP</div>
        <div class="xp-counter-player">{{xpPerPlayer}} per player</div>
      </div>
    </div>
    <div class="xp-body">
      <p class="xp-desc" v-show="removed.length">Total monsters slain: <span class="xp-desc-counter">{{removed.length}}</span></p>
      <div class="xp-item" v-for="(monster, index) in list">
        <div class="xp-item-controls">
          <span class="xp-plus" @click="addMonster(monster)">+</span>
          <span class="xp-quantity">{{monster.quantity}}</span>
          <span class="xp-minus" @click="removeMonster(monster)">-</span>
        </div>
        <div class="xp-item-name">{{monster.displayName}}</div>
        <div class="xp-item-counter">
          {{monster.xp * monster.quantity}} XP
          <div class="xp-item-xppm" v-show="monster.quantity > 1">{{monster.xp}} XP x {{monster.quantity}}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import type from '../monster-type.json'

export default {
  props: ['monsters', 'removed', 'monsterList'],
  data () {
    return {
      expanded: false
    }
  },
  computed: {
    total () {
      if (!this.removed.length) return 0;
      if (this.removed.length === 1) return this.removed[0].xp;

      return this.removed.reduce((prev, cur) => cur.xp + prev, 0);
    },
    xpPerPlayer () {
      if (this.total === 0) return 0;
      if (!this.monsters.some(monster => monster.type === type.character)) return 0;

      return parseInt(this.total / this.findPlayers(), 10);
    },
    list () {
      let compactList = {};

      this.removed.forEach(monster => {
        let key = monster.key ? monster.key : monster.name;

        if (!compactList.hasOwnProperty(key)) {
          let displayName;

          if (monster.key) {
            displayName = this.monsterList.find(o => o.key === monster.key);
            displayName = displayName === undefined ? monster.name : displayName.name;
          } else {
            displayName = monster.name;
          }
          compactList[key] = Object.assign({quantity: 1, displayName}, monster);
        } else {
          compactList[key].quantity++;
        }
      });

      let list = [];

      Object.values(compactList).forEach(monster => {
        list.push(monster);
      });
      list.sort((a, b) => a.displayName.toLowerCase() < b.displayName.toLowerCase() ? -1 : 1);

      return list;
    }
  },
  methods: {
    findPlayers () {
      return this.monsters.filter(monster => monster.type === type.character).length;
    },
    addMonster (monster) {
      if (monster.quantity > 99) return;

      this.$emit('killMonster', monster);
    },
    removeMonster (monster) {
      if (monster.quantity < 1) return;

      this.$emit('reviveMonster', monster);
    }
  }
}
</script>

<style lang="scss">
.xp-tracker {
  position: fixed;
  overflow: hidden;
  bottom: 0;
  left: 0;
  height: calc(100vh - 53px);
  width: 320px;
  background: #fff;
  border-top: 1px solid #ebebeb;
  transition: all .4s ease-in-out;
  transform: translateY(calc(100vh - 106px));
  &.expanded {
    transform: translateY(0);
  }
}
.xp-header {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  height: 52px;
  cursor: pointer;
}
.xp-controls,
.xp-counter {
  flex: 0 1 auto;
}
.xp-counter {
  flex-grow: 1;
  flex-shrink: 0;
  text-align: right;
  margin-right: 10px;
  .xp-counter-total {
    font-size: 18px;
  }
  .xp-counter-player {
    font-size: 12px;
    font-style: italic;
    color: #666;
  }
}
.xp-body {
  border-top: 1px solid #ebebeb;
}
.xp-desc {
  text-align: right;
  margin-right: 10px;
  font-size: 14px;
  color: #666;
  .xp-desc-counter {
    color: #2c3e50;
    font-weight: 700;
    font-size: 18px;
  }
}
.xp-item {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  height: 48px;
  align-items: stretch;
  border-bottom: 1px solid #ebebeb;
  padding: 0 10px 0 0;
  &:first-of-type {
    border-top: 1px solid #ebebeb;
  }
}
.xp-item-name,
.xp-item-counter {
  flex: 1 1 auto;
}
.xp-item-name {
  line-height: 48px;
  text-align: left;
  margin-left: 10px;
}
.xp-item-counter {
  position: relative;
  text-align: right;
  font-weight: 700;
  flex-grow: 0;
  line-height: 48px;
  flex-basis: 70px
}
.xp-item-xppm {
  position: absolute;
  bottom: 3px;
  right: 0;
  font-size: 11px;
  line-height: normal;
  color: #666;
  font-style: italic;
  font-weight: normal;
}
.xp-item-controls {
  flex: 0 0 48px;
  height: 100%;
  background: #aac;
  position: relative;
}
.xp-plus,
.xp-minus {
  font-size: 22px;
  cursor: pointer;
  position: absolute;
  top: 12px;
  left: 2px;
}
.xp-minus {
  right: 6px;
  left: auto;
  top: 11px;
}
.xp-quantity {
  line-height: 48px;
}
</style>
