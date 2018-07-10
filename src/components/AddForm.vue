<template>
  <div class="form-container">
    <div class="monster-form">
      <h1>Add new monster</h1>
      <div class="monster-stat">
        <span class="f-s-24 f-w-b"><input v-model.trim="monster.name" placeholder="Name"></span>
        <div class="f-s-18 i f-w-b"><input placeholder="Type" class="monster-type" v-model.trim="monster.type"></div>
        <div><span class="f-w-b">Armor Class:</span><span class="m-l-10"><input v-model.trim="monster.ac"></span></div>
        <div><span class="f-w-b">Hit Points:</span><span class="m-l-10"><input v-model.trim="monster.hits" placeholder="12d10 + 34 (90)"></span></div>
        <div><span class="f-w-b">Speed:</span><span class="m-l-10"><input v-model.trim="monster.speed"></span></div>
        <div class="attributes">
          <div class="t-a-c p-5"><div class="f-w-b f-s-14">STR</div><div>
          <input v-model.trim="monster.attr.str" placeholder="12">
          <label class="monster-mod">{{getMod(monster.attr.str)}}</label>
          </div></div>
          <div class="t-a-c p-5"><div class="f-w-b f-s-14">DEX</div><div>
          <input v-model.trim="monster.attr.dex" placeholder="12">
          <label class="monster-mod">{{getMod(monster.attr.dex)}}</label>
        </div></div>
          <div class="t-a-c p-5"><div class="f-w-b f-s-14">CON</div><div>
          <input v-model.trim="monster.attr.con" placeholder="12">
          <label class="monster-mod">{{getMod(monster.attr.con)}}</label>
        </div></div>
          <div class="t-a-c p-5"><div class="f-w-b f-s-14">INT</div><div>
          <input v-model.trim="monster.attr.intel" placeholder="12">
          <label class="monster-mod">{{getMod(monster.attr.intel)}}</label>
        </div></div>
          <div class="t-a-c p-5"><div class="f-w-b f-s-14">WIS</div><div>
          <input v-model.trim="monster.attr.wis" placeholder="12">
          <label class="monster-mod">{{getMod(monster.attr.wis)}}</label>
        </div></div>
          <div class="t-a-c p-5"><div class="f-w-b f-s-14">CHA</div><div>
          <input v-model.trim="monster.attr.cha" placeholder="12">
          <label class="monster-mod">{{getMod(monster.attr.cha)}}</label>
        </div></div>
        </div>
        <div class="props">
          <p>Properties <a href="#" @click.prevent="addProp" class="control-button">+</a></p>
          <div v-for="prop in monster.props">
            <span class="f-w-b"><input v-model.trim="prop.title"></span>
            <span class="m-l-10"><input v-model="prop.content"></span>
          </div>
          <div>
            <span class="f-w-b">Challenge</span>
            <span class="m-l-10"><input v-model.trim="monster.challenge"></span>
          </div>
        </div>
        <div class="sprops">
          <p>Special Properties <a href="#" @click.prevent="addSProp" class="control-button">+</a></p>
          <div class="m-t-10" v-for="prop in monster.sprops">
            <span class="f-w-b"><input v-model.trim="prop.title"></span>
            <span class="m-l-10 action-wrapper"><textarea class="action-text" v-model="prop.content" rows="4"></textarea></span>
          </div>
        </div>
        <div class="m-t-20">
          <div class="i f-w-b f-s-18">Actions</div>
          <p>Action <a href="#" @click.prevent="addAction" class="control-button">+</a></p>
          <div>
            <div v-for="action in monster.actions" class="m-t-10">
              <div>
                <span class="f-w-b"><input v-model.trim="action.title"></span>
                <span class="m-l-10 action-wrapper"><textarea class="action-text" v-model="action.content"></textarea></span>
              </div>
            </div>
          </div>
        </div>
        <div class="m-t-20">
          <div class="i f-w-b f-s-18">Reactions</div>
          <p>Reaction <a href="#" @click.prevent="addReaction" class="control-button">+</a></p>
          <div>
            <div v-for="action in monster.reactions" class="m-t-10">
              <div>
                <span class="f-w-b"><input v-model.trim="action.title"></span>
                <span class="m-l-10 action-wrapper"><textarea class="action-text" v-model="action.content"></textarea></span>
              </div>
            </div>
          </div>
        </div>
        <div class="m-t-20">
          <div class="i f-w-b f-s-18">Legendary Actions</div>
          <div><textarea v-model="monster.ldescription" cols="70" rows="5" style="max-width: 445px;"></textarea></div>
          <div>
            <p>Legendary Action <a href="#" @click.prevent="addLAction" class="control-button">+</a></p>
            <div class="m-t-10" v-for="laction in monster.lactions">
              <div><span class="f-w-b"><input v-model.trim="laction.title"></span><span class="m-l-10 action-wrapper"><textarea class="action-text" v-model="laction.content"></textarea></span></div>
            </div>
          </div>
        </div>
      </div>
      <div class="form-butttons">
        <a href="#" @click.prevent="submit" v-show="!working">Save</a>
        <span v-show="working">saving...</span>
        <a href="#" @click.prevent="reset">Reset</a>
      </div>
    </div>
    <div class="user-list">
      <div class="user-monster" v-for="(monster, index) in user.monsters">
        <span class="user-monster-name">{{monster.name}}</span><span class="edit-button" @click.stop="edit(monster, index)">✍</span><span class="delete-button" @click.stop="remove(monster, index)">-</span>
      </div>
    </div>
  </div>
</template>

<script>
import Server from '../server'

export default {
  props: ['user'],
  data () {
    return {
      monster: {
        name: '',
        key: '',
        type: '',
        ac: '',
        hits: '',
        speed: '',
        attr: {
          str: '',
          dex: '',
          con: '',
          intel: '',
          wis: '',
          cha: ''
        },
        props: [],
        sprops: [],
        actions: [],
        reactions: [],
        ldescription: '',
        lactions: [],
        challenge: ''
      },
      working: false
    }
  },
  methods: {
    addProp () {
      this.monster.props.push({ title: '', content: '' });
    },
    addSProp () {
      this.monster.sprops.push({ title: '', content: '' });
    },
    addAction () {
      this.monster.actions.push({ title: '', content: '' });
    },
    addReaction () {
      this.monster.reactions.push({ title: '', content: '' });
    },
    addLAction () {
      this.monster.lactions.push({ title: '', content: '' });
    },
    reset () {
      this.monster = {
        name: '',
        key: '',
        type: '',
        ac: '',
        hits: '',
        speed: '',
        attr: {
          str: '',
          dex: '',
          con: '',
          intel: '',
          wis: '',
          cha: ''
        },
        props: [],
        sprops: [],
        actions: [],
        reactions: [],
        ldescription: '',
        lactions: [],
        challenge: ''
      }
    },
    submit () {
      if (!this.monster.name ||
        !this.monster.attr.dex ||
        !this.monster.hits) return;

      let duplicate = this.user.monsters.some(monster => {
        return monster.name.toLowerCase() === this.monster.name.toLowerCase()
      });

      if (duplicate) {
        this.monster.name = '!NAME DUPLICATE';
        return;
      }

      this.monster.props = this.monster.props.filter(e => e.title && e.content);
      this.monster.sprops = this.monster.sprops.filter(e => e.title && e.content);
      this.monster.actions = this.monster.actions.filter(e => e.title && e.content);
      this.monster.reactions = this.monster.reactions.filter(e => e.title && e.content);
      this.monster.lactions = this.monster.lactions.filter(e => e.title && e.content);

      let xp = /((\d+\s?,?\s?\d+)\s?[xX][pP])/.exec(this.monster.challenge);
      xp = xp === null ? 0 : parseInt(xp[2].replace(/[\s,]/g, ''));
      if (isNaN(xp) || xp < 0) xp = 0;

      let monsterObj = {
        description: this.monster,
        name: this.monster.name,
        dex: this.getMod(this.monster.attr.dex, true),
        hits: this.monster.hits,
        xp
      }

      this.working = true;

      Server.addMonster(this.user, monsterObj).then(() => {
        this.working = false;
      });
    },
    getMod (str, intType = false) {
      if (!str.length) return '';

      let d = parseInt(str, 10);
      if (isNaN(d)) return 0;

      if (intType) {
        return Math.floor((d - 10) / 2);
      } else {
        let mod = Math.floor((d - 10) / 2);
        return mod > 0 ? '+' + mod : mod;
      }
    },
    remove (monster, index) {
      this.user.monsters.splice(index, 1);
      Server.removeMonster(monster);
    },
    edit (monster, index) {
      Server.editMonster(monster).then(data => {
        if (data === false) {
          this.monster.name = '!NO DATA';
          this.monster.key = '';
          return;
        }

        this.monster = data;
      });
    }
  }
}
</script>

<style lang="scss">
.form-container {
  display: flex;
  flex-direction: row;
  min-height: 100%;
  > div {
    flex: 0 1 auto;
  }
  .monster-type {
    width: 80%;
  }
}
.monster-form {
  max-width: 500px;
  background: #ddd;
  margin-top: 52px;
  textarea {
    font-size: 11px;
  }
  input {
    margin-bottom: 3px;
    font-size: 11px;
  }
  .props {
    .m-l-10 {
      input {
        width: 275px;
      }
    }
  }
  h1 {
    margin-bottom: 5px;
  }
  .monster-stat {
    padding-top: 5px;
    >div > span.f-w-b {
      display: inline-block;
      width: 110px;
    }
  }
  .m-t-10 {
    margin-top: 10px;
  }
}
.attributes {
  input {
    width: 14px;
  }
  .monster-mod {
    font-size: 12px;
    vertical-align: middle;
  }
}
.user-list {
  margin-top: 52px;
  max-width: 300px;
  .user-monster {
    display: flex;
    flex-direction: row;
    width: 300px;
    background: #aac;
    border-bottom: 1px solid #fff;
  }
  .user-monster-name {
    display: inline-block;
    white-space: nowrap;
    text-overflow: ellipsis;
    width: 268px;
    line-height: 32px;
  }
  .delete-button {
    display: inline-block;
  }
  .edit-button {
    display: inline-block;
    height: 32px;
    width: 26px;
    font-size: 24px;
    color: #fff;
    background: #bebebe;
    line-height: 32px;
    flex: 1 1 auto;
    cursor: pointer;
    text-align: center;
    transition: background-color .4s;
    &:hover {
      background: #f1cea0;
    }
  }
}
.action-wrapper {
  display: inline-block;
  vertical-align: middle;
}
.action-text {
  width: 275px;
  height: 60px;
}
</style>
