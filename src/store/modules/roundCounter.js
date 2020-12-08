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
  PREV (state) {
    state.order > 0 && state.order--;
  },
  RESET (state) {
    state.order = 0;
    state.round = 1;
  }
}

const actions = {
  next ({ state, commit, rootState }) {
    if (rootState.encounter.actors.length === 0) return;
    commit('NEXT', rootState.encounter.actors.length);

    const uid = rootState.encounter.actors[state.order].uid;
    commit('encounter/SELECT_ACTOR', uid, { root: true });
  },
  reset ({ commit }) {
    commit('RESET');
  },
  onRemoveActor ({ state, commit, rootState }, index) {
    // don't commit if that's the last actor
    if (rootState.encounter.actors.length === 1) return ;

    if (index < state.order && state.order > 0) {
      commit('PREV');
    } else if (index === rootState.encounter.actors.length - 1 && index === state.order) {
      commit('NEXT', rootState.encounter.actors.length);
    }
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
}