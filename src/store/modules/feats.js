import Feat from '../../model/feat';

const state = () => ({
  _dialog: false,
  _featContent: '',
  _featName: '',
  feat: new Feat(),
})

const getters = {}

const mutations = {
  TOGGLE_DIALOG (state, value) { state._dialog = value; },
  SET_CONTENT (state, value) { state._featContent = value; },
  SET_NAME (state, value) { state._featName = value; },
  RESET_FORM (state) {
    state._dialog = false;
    state._featName = '';
    state._featContent = '';
    state.feat = new Feat();
  },
  SET_FEAT (state, obj = false) {
    obj = obj || new Feat();
    state.feat = obj;
  },
  FEAT_TO_FORM (state) {
    state._featName = state.feat.name;
    state._featContent = state.feat.content;
  },
}

const actions = {
  async save ({ state, commit, dispatch, rootGetters }) {
    const newFeat = Object.assign(new Feat(), state.feat);
    newFeat.name = state._featName;
    newFeat.content = state._featContent;

    // check for uniqueness
    if (rootGetters['data/featIndex'].find(f => (
      f.name.toLowerCase() === newFeat.name.toLowerCase()
      && f.key !== newFeat.key
    ))) {
      dispatch('server/error', `Feat with the name ${newFeat.name} already exists`, { root: true });
      return;
    }

    try {
      await dispatch('server/saveFeat', newFeat, { root: true });
    } catch (e) {
      console.error(e);
      return;
    }

    // reset form
    commit('SET_FEAT', new Feat());
    commit('RESET_FORM');
  },
  async edit ({ state, commit, dispatch }, indexObject) {
    // load the feat and show it in the dialog
    commit('server/SET_USER_LOADING', true, { root: true });

    try {
      await dispatch('server/getFeat', {
        indexObject,
        featObject: new Feat()
      }, { root: true });
    } catch (e) {
      console.error(e);
      return;
    }

    commit('server/SET_USER_LOADING', false, { root: true });
  },
  loadFeat ({ state, commit }, feat) {
    commit('SET_FEAT', feat);
    commit('FEAT_TO_FORM');
    commit('TOGGLE_DIALOG', true);
  },
  async remove ({ state, commit, dispatch }, indexObject) {
    commit('server/SET_USER_LOADING', true, { root: true });

    try {
      await dispatch('server/removeFeat', {
        indexObject,
      }, { root: true });
    } catch (e) {
      console.error(e);
      return;
    }

    commit('server/SET_USER_LOADING', false, { root: true });
  },
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
}