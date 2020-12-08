const state = () => ({
  _monsterIndex: [],
  _userMonsterIndex: [],
  _spellIndex: [],
  _userSpellIndex: [],
});

const getters = {
  monsterIndex (state, getters, rootState) {
    if (rootState.user.state) {
      return [...state._monsterIndex, ...state._userMonsterIndex];
    }
    return state._monsterIndex;
  },
  spellIndex (state, getters, rootState) {
    if (rootState.user.state) {
      return [...state._spellIndex, ...state._userSpellIndex];
    }
    return state._spellIndex;
  },
}

const mutations = {
  SET_MONSTER_INDEX (state, payload) {
    if (!Array.isArray(payload)) {
      console.error('Trying to set monster index with invalid array');
      return;
    }
    state._monsterIndex = payload;
  },
  SET_USER_INDEX (state, payload) {
    if (!Array.isArray(payload)) {
      console.error('Trying to set user monster index with invalid array');
      return;
    }
    state._userMonsterIndex = payload;
  },
  PUSH_USER_INDEX (state, el) {
    state._userMonsterIndex.push(el);
  },
  UPDATE_USER_INDEX (state, el) {
    const i = state._userMonsterIndex.findIndex(m => m.key === el.key);
    if (i < 0) throw new Error('Trying to update non-existing user index');
    state._userMonsterIndex.splice(i, 1, el);
  },
  REMOVE_USER_INDEX (state, el) {
    const i = state._userMonsterIndex.findIndex(m => m.key === el.key);
    if (i < 0) return;
    state._userMonsterIndex.splice(i, 1);
  },
  SET_SPELL_INDEX (state, payload) {
    if (!Array.isArray(payload)) {
      console.error('Trying to set user spell index with invalid array');
      return;
    }
    state._spellIndex = payload;
  },
  SET_USER_SPELL_INDEX (state, payload) {
    if (!Array.isArray(payload)) {
      console.error('Trying to set user spell index with invalid array');
      return;
    }
    state._userSpellIndex = payload;
  },
  PUSH_USER_SPELL_INDEX (state, el) {
    state._userSpellIndex.push(el);
  },
  UPDATE_USER_SPELL_INDEX (state, el) {
    const i = state._userSpellIndex.findIndex(m => m.key === el.key);
    if (i < 0) throw new Error('Trying to update non-existing user index');
    state._userSpellIndex.splice(i, 1, el);
  },
  REMOVE_USER_SPELL_INDEX (state, el) {
    const i = state._userSpellIndex.findIndex(m => m.key === el.key);
    if (i < 0) return;
    state._userSpellIndex.splice(i, 1);
  },
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
}