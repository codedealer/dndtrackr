const state = () => ({
  _monsterIndex: [],
});

const getters = {
  monsterIndex (state) {
    return state._monsterIndex;
  }
}

const mutations = {
  SET_MONSTER_INDEX (state, payload) {
    if (!Array.isArray(payload)) {
      console.error('Trying to set monster index with invalid array');
      return;
    }
    state._monsterIndex = payload;
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
}