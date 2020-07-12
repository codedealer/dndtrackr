import Actor from '../../model/actor';
import ACTOR_TYPES from '../../model/ACTOR_TYPES';
import COLORS from '../../model/COLORS';
import dataFactory from '../../utils/actorDataFactory';
import statUtils from '../../utils/statUtils';
import parser from '../../parser';

import { merge } from 'lodash-es';

const state = () => ({
  uid: 0,
  selected: false,
  actors: [],
});

const mutations = {
  ADD_ACTOR (state) {
    state.actors.push(new Actor(state.uid++));
    state.selected = state.uid - 1;
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
  CHANGE_ACTOR_TYPE (state, index) {
    state.actors[index].type = (state.actors[index].type + 1) % 2;
  },
  CHANGE_ACTOR_COLOR (state, { actorIndex, colorIndex }) {
    state.actors[actorIndex].color = COLORS[colorIndex];
  },
  SET_ACTOR_NAME (state, { index, value }) {
    state.actors[index].name = value;
  },
  SET_ACTOR_KEY (state, { index, value }) {
    if (!value) value = '';
    state.actors[index].key = value;
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
  },
  ADD_STATUS (state, { index, status }) {
    state.actors[index].status.push(status);
  },
  EDIT_STATUS (state, { actorIndex, statusIndex, status }) {
    state.actors[actorIndex].status.splice(statusIndex, 1, status);
  },
  DELETE_STATUS (state, { actorIndex, statusIndex }) {
    state.actors[actorIndex].status.splice(statusIndex, 1);
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
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
}