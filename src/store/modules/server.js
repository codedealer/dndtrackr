import firebase from 'firebase/app';
import 'firebase/auth';
import config from '../../config';

const state = {
  errorMsg: '',
  error: false,
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
}

const actions = {
  async init ({ state, commit }) {
    if (firebase.apps.length) return;

    firebase.initializeApp(config.firebaseConfig);

    // hookup user listener
    firebase.auth().onAuthStateChanged(user => {
      commit('UPDATE_USER', user, { root: true });
    });

    try {
      const response = await fetch('/data/monster_index.json');
      const monsterIndex = await response.json();

      commit('data/SET_MONSTER_INDEX', monsterIndex, { root: true });
    } catch (e) {
      commit('SET_MSG', 'Error downloading monster index.');
      commit('SET_ERROR', true);
    }
  },
  async signIn ({ state, commit }) {
    let provider = new firebase.auth.GoogleAuthProvider();

    try {
      await firebase.auth().signInWithPopup(provider);
    } catch (e) {
      commit('SET_MSG', e.message || 'Error encountered upon signing in.');
      commit('SET_ERROR', true);
    }
  },
  async signOut ({ state }) {
    try {
      await firebase.auth().signOut();
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