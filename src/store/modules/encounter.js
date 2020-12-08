import Actor from '../../model/actor';
import ACTOR_TYPES from '../../model/ACTOR_TYPES';
import COLORS from '../../model/COLORS';
import dataFactory from '../../utils/actorDataFactory';
import statUtils from '../../utils/statUtils';
import parser from '../../parser';

import Vue from 'vue'
import { merge } from 'lodash-es';

const state = () => ({
  uid: 0,
  selected: false,
  actors: [],
  keyMessagePipe: '',
});

const getters = {
  characters: state => state.actors.filter(a => a.type === ACTOR_TYPES.character),
}

const mutations = {
  ADD_ACTOR (state) {
    state.actors.push(new Actor(state.uid++));
    state.selected = state.uid - 1;
  },
  LOAD_ACTOR (state, { index, actor }) {
    state.actors.splice(index, 1, actor);
  },
  SELECT_ACTOR (state, uid) {
    state.selected = uid;
  },
  SET_ACTOR_INITIATIVE (state, { index, value }) {
    value = value < 0 ? 0 : value;
    if (value !== '' && typeof value === 'string') {
      value = '';
    }

    state.actors[index].initiative = value;
  },
  SORT_ACTORS (state) {
    state.actors.sort((a, b) => {
      if (a.initiative === 0 || a.initiative === '') return 1;

      if (a.initiative === b.initiative) {
        // check dex modifier
        let modA = statUtils.getModifier(a.data.attributes.dexterity);
        let modB = statUtils.getModifier(b.data.attributes.dexterity);
        return modA > modB ? -1 : 1;
      }

      return a.initiative > b.initiative ? -1 : 1;
    });
  },
  RENAME_ACTORS (state) {
    const duplicates = [];

    state.actors.forEach((monster, index, arr) => {
      if (!monster.name.length || monster.type === ACTOR_TYPES.character) return;
      if (duplicates.includes(monster.name)) return;

      arr.forEach((m, i) => {
        if (monster.name === m.name && index !== i) duplicates.push(monster.name);
      });
    });

    duplicates.forEach((name) => {
      let i = 1;
      state.actors.forEach((monster) => {
        if (monster.name === name) {
          monster.name = `${name} ${i}`;

          if (COLORS.length > i - 1) monster.color = COLORS[i - 1];

          i++;
        }
      });
    });
  },
  CHANGE_ACTOR_TYPE (state, index) {
    state.actors[index].type = (state.actors[index].type + 1) % 2;

    state.actors[index].settings.dirty = true;
  },
  CHANGE_ACTOR_COLOR (state, { actorIndex, colorIndex }) {
    state.actors[actorIndex].color = COLORS[colorIndex];

    state.actors[index].settings.dirty = true;
  },
  SET_ACTOR_NAME (state, { index, value }) {
    state.actors[index].name = value;

    state.actors[index].settings.dirty = true;
  },
  SET_ACTOR_KEY (state, { index, value }) {
    if (!value) value = '';
    state.actors[index].key = value;
  },
  SET_ACTOR_NOTES (state, { index, value }) {
    state.actors[index].notes = value;

    state.actors[index].settings.dirty = true;
  },
  REMOVE_ACTOR (state, index) {
    if (state.selected === state.actors[index].uid) {
      state.selected = false;
    }
    state.actors.splice(index, 1);
  },
  RESET_DATA (state, index) {
    state.actors[index].data = dataFactory();
  },
  UPDATE_SETTINGS (state, { index, ...settings }) {
    merge(state.actors[index].settings, settings);
  },
  UPDATE_DATA (state, { index, ...data }) {
    merge(state.actors[index].data, data);

    state.actors[index].settings.dirty = true;
  },
  PUSH_DATA_ARRAY (state, { index, propertyName, ...data }) {
    state.actors[index].data[propertyName].push(data);

    state.actors[index].settings.dirty = true;
  },
  UPDATE_DATA_ARRAY (state, { index, propertyName, i, ...data }) {
    merge(state.actors[index].data[propertyName][i], data);

    state.actors[index].settings.dirty = true;
  },
  REMOVE_DATA_ARRAY (state, { index, propertyName, i }) {
    state.actors[index].data[propertyName].splice(i, 1);

    state.actors[index].settings.dirty = true;
  },
  REMOVE_SKILL (state, { index, skill }) {
    Vue.delete(state.actors[index].data.skills, skill);

    state.actors[index].settings.dirty = true;
  },
  ADD_STATUS (state, { index, status }) {
    state.actors[index].status.push(status);

    state.actors[index].settings.dirty = true;
  },
  EDIT_STATUS (state, { actorIndex, statusIndex, status }) {
    state.actors[actorIndex].status.splice(statusIndex, 1, status);

    state.actors[actorIndex].settings.dirty = true;
  },
  DELETE_STATUS (state, { actorIndex, statusIndex }) {
    state.actors[actorIndex].status.splice(statusIndex, 1);

    state.actors[actorIndex].settings.dirty = true;
  },
  SET_KEY_MESSAGE (state, value) {
    state.keyMessagePipe = value;
  },
}

const actions = {
  async generateInitiative ({ state, dispatch }, regenerate = false) {
    const results = [];
    state.actors.forEach((actor, index) => {
      if (actor.type === ACTOR_TYPES.character) return false;
      if (!regenerate && actor.initiative) return false;

      let mod = statUtils.getModifier(actor.data.attributes.dexterity);
      let str = 'd20';
      if (mod !== 0) {
        str += mod > 0 ? '+' + mod : '' + mod;
      }

      let diceParams = parser.parse(str);

      results.push(dispatch('diceRoller/rollInitiative', { diceParams, index }, { root: true }));
    });

    await Promise.all(results);
  },
  removeActor ({ state, commit, dispatch }, index) {
    const actor = state.actors[index];
    dispatch('xpTracker/addRecord', actor, { root: true });
    dispatch('roundCounter/onRemoveActor', index, { root: true });
    commit('REMOVE_ACTOR', index);
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
}