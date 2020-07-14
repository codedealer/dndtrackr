import Record from '../../model/killRecord';

const state = () => ({
  records: [],
});

const getters = {

}

const mutations = {
  ADD_RECORD (state, record) {
    state.records.push(record);
  },
}

const actions = {
  addRecord ({ commit, rootGetters }, actor) {
    // skip nameless actors
    if (!actor.name) return;

    commit('ADD_RECORD', new Record(actor, rootGetters['encounter/characters'].length));
  },
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
}