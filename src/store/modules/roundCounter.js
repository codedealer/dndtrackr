const state = () => ({
  round: 1,
  order: 0,
});

const mutations = {
  NEXT (state, length) {
    state.order++;
    if (state.order >= length) {
      state.order = 0;
      state.round++;
    }
  },
  RESET (state) {
    state.order = 0;
    state.round = 1;
  }
}

const actions = {
  next ({ state, commit, rootState }) {
    commit('NEXT', rootState.encounter.actors.length);

    const uid = rootState.encounter.actors[state.order].uid;
    commit('encounter/SELECT_ACTOR', uid, { root: true });
  },
  reset ({ commit }) {
    commit('RESET');
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
}