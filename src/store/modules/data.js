const state = () => ({
  _monsterIndex: [],
  _userMonsterIndex: [],
});

const getters = {
  monsterIndex (state) {
    return [...state._monsterIndex, ...state._userMonsterIndex];
  }
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
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
}