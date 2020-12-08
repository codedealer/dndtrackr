import Spell from '../../model/spell';
import { merge } from 'lodash-es';

const state = () => ({
  spell: false,
});

const mutations = {
  SET_SPELL (state, value) {
    if (value !== undefined) {
      state.spell = value;
      return;
    }
    state.spell = new Spell();
  },
  UPDATE_DATA (state, data) {
    if (state.spell === false) return;

    merge(state.spell.data, data);

    state.spell.settings.dirty = true;
  },
  SET_DIRTY (state, value) {
    state.spell.settings.dirty = value;
  },
  SET_KEY (state, key) {
    state.spell.key = key;
  }
};

const actions = {};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
}