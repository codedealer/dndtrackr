import Record from '../../model/killRecord';

const state = () => ({
  records: [],
  latest: false,
  tid: null,
});

const getters = {
  feed: state => state.records.slice().reverse(),
  showLatest: state => state.latest,
}

const mutations = {
  ADD_RECORD (state, record) {
    state.records.push(record);
  },
  REMOVE_RECORD (state, record) {
    let index = state.records.findIndex(r => r.actor.uid === record.actor.uid);
    if (index < 0) return;
    state.records.splice(index, 1);
  },
  CLEAR_RECORDS (state) {
    state.records = [];
  },
  TOGGLE_LATEST (state, value) {
    clearTimeout(state.tid);
    state.latest = value;
  },
  SET_TID (state, value) {
    state.tid = value;
  },
}

const actions = {
  addRecord ({ commit, rootGetters }, actor) {
    // skip nameless actors
    if (!actor.name) return;

    commit('ADD_RECORD', new Record(actor, rootGetters['encounter/characters'].length));
    commit('TOGGLE_LATEST', true);
    const tid = setTimeout(() => { commit('TOGGLE_LATEST', false) }, 5000);
    commit('SET_TID', tid);
  },
  removeRecord ({ commit }, record) {
    commit('TOGGLE_LATEST', false);
    commit('REMOVE_RECORD', record);
  },
  restoreRecord ({ commit, dispatch, rootState }, record) {
    commit('encounter/LOAD_ACTOR', {
      index: rootState.encounter.actors.length,
      actor: record.actor,
    }, { root: true });
    dispatch('removeRecord', record);
  },
  clearRecords ({ commit }) {
    commit('CLEAR_RECORDS');
    commit('TOGGLE_LATEST', false);
  },
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
}