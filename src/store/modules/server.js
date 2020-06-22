import firebase from 'firebase/app';
import 'firebase/auth';
import config from '../../config';

const state = {
  errorMsg: '',
  error: false,
  firebase,
}

const getters = {
  error: state => state.error,
  errorMsg: state => state.errorMsg,
}

const mutations = {
  SET_ERROR (state, value) {
    state.error = value;
  },
  SET_MSG (state, value) {
    state.errorMsg = value;
  },
  INIT (state, value) {
    state.app = value;
  },
}

const actions = {
  async init ({ state, commit }) {
    if (firebase.apps.length) return;

    firebase.initializeApp(config.firebaseConfig);

    // hookup user listener
    firebase.auth().onAuthStateChanged(user => {
      commit('UPDATE_USER', user, { root: true });
    });
  },
  async signIn ({ state, commit }) {
    let provider = new state.firebase.auth.GoogleAuthProvider();

    try {
      await state.firebase.auth().signInWithPopup(provider);
    } catch (e) {
      commit('SET_MSG', e.message || 'Error encountered upon signing in.');
      commit('SET_ERROR', true);
    }
  },
  async signOut ({ state }) {
    try {
      await state.firebase.auth().signOut();
    } catch (e) {
      commit('SET_MSG', e.message || 'Error encountered upon signing out.');
      commit('SET_ERROR', true);
    }

  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
}