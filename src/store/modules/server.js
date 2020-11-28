import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import config from '../../config';
import ActorClass from '../../model/actor';
import DataDecorator from '../../utils/serverDecorator';

import { merge } from 'lodash-es';

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
    firebase.auth().onAuthStateChanged(async (user) => {
      commit('UPDATE_USER', user, { root: true });
      if (user && user.uid) {
        // get user indexes
        try {
          const snapshot = await firebase.database().ref(`userIndex/${user.uid}`).once('value');
          if (!snapshot.exists()) {
            console.log('No user data found');
          } else {
            const userData = snapshot.val();
            if (userData.actors) {
              // build actor index
              commit('data/SET_USER_INDEX', Object.values(userData.actors), { root: true });
            }
          }
        } catch (e) {
          commit('SET_MSG', 'Error downloading user index.');
          commit('SET_ERROR', true);
        }
      }
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
  },
  async getActorData ({ commit }, { index, actor }) {
    try {
      const snapshot = await firebase.database().ref(`monsters/${actor.key}`).once('value');
      if (!snapshot.exists()) {
        commit('SET_MSG', `No data for ${actor.name}`);
        commit('SET_ERROR', true);
        commit('encounter/SET_ACTOR_KEY', { index, value: '' }, { root: true });
        return;
      }

      // reset the data beforehand
      commit('encounter/RESET_DATA', index, { root: true });
      const data = DataDecorator.prepare(snapshot.val());
      commit('encounter/UPDATE_DATA', { index, ...data }, { root: true });
    } catch (e) {
      commit('SET_MSG', e.message || 'Cannot get data for ' + actor.name);
      commit('SET_ERROR', true);
      throw e;
    }
  },
  async getActor ({ state, rootState, commit, dispatch }, { index, actor }) {
    if (rootState.data._userMonsterIndex.some(a => a.key === actor.key)) {
      // actor belongs to the user
      // full object will be retrieved
      try {
        const snap = await firebase
                    .database()
                    .ref(`userData/${rootState.user.uid}/actors/${actor.key}`)
                    .once('value');
        if (!snap.exists()) {
          commit('SET_MSG', `No data for ${actor.name}`);
          commit('SET_ERROR', true);
          commit('encounter/SET_ACTOR_KEY', { index, value: '' }, { root: true });
          return;
        }

        const serverActorData = snap.val();
        // data normalization
        const newActor = new ActorClass(actor.uid, serverActorData.type);
        merge(newActor, serverActorData);

        commit('encounter/LOAD_ACTOR', { index, actor: newActor }, { root: true });
      } catch (e) {
        commit('SET_MSG', e.message || 'Cannot get data for ' + actor.name);
        commit('SET_ERROR', true);
        throw e;
      }
    } else {
      // this is a public actor, only data object will be retrieved
      await dispatch('getActorData', { index, actor });
    }
  },
  async saveActor ({ state, rootState, commit }, { index, actor }) {
    commit('encounter/UPDATE_SETTINGS', { index, dirty: false }, { root: true });

    let key = actor.key;
    let isNew = false;
    if (!key) {
      // new stuff
      isNew = true;
      const indexRef = firebase.database().ref(`userIndex/${rootState.user.uid}/actors`).push();
      key = indexRef.key;
    }
    const actorIndex = DataDecorator.getActorIndex(actor, rootState.user.uid, key);
    const actorPayload = DataDecorator.getActorPayload(actor, key);

    const rootRef = firebase.database().ref();
    const updatePayload = {
      [`userIndex/${rootState.user.uid}/actors/${key}`]: actorIndex,
      [`userData/${rootState.user.uid}/actors/${key}`]: actorPayload,
    }

    try {
      await rootRef.update(updatePayload);
    } catch (e) {
      commit('SET_MSG', e.message || 'Error. Couldn\'t save.');
      console.error(e);
      commit('SET_ERROR', true);
      commit('encounter/UPDATE_SETTINGS', { index, dirty: true }, { root: true });
      return;
    }

    commit('encounter/SET_ACTOR_KEY', { index, value: key }, { root: true });
    if (isNew) {
      // add the new actor to the index
      commit('data/PUSH_USER_INDEX', actorIndex, { root: true });
    } else {
      // update index information
      commit('data/UPDATE_USER_INDEX', actorIndex, { root: true });
    }

    commit('SET_MSG', 'Saved.');
    commit('SET_ERROR', true);
  },
  async forkActor ({ commit, dispatch }, { index, actor }) {
    // remove the key and save as the new actor
    commit('encounter/SET_ACTOR_KEY', { index, value: '' }, { root: true });
    await dispatch('saveActor', { index, actor });
  },
  async removeActor ({ state, rootState, commit }, { index, actor }) {
    let key = actor.key;
    const rootRef = firebase.database().ref();
    const updatePayload = {
      [`userIndex/${rootState.user.uid}/actors/${key}`]: null,
      [`userData/${rootState.user.uid}/actors/${key}`]: null,
    }

    try {
      await rootRef.update(updatePayload);
    } catch (e) {
      commit('SET_MSG', e.message || 'Error. Couldn\'t remove.');
      console.error(e);
      commit('SET_ERROR', true);
      return;
    }

    commit('data/REMOVE_USER_INDEX', actor, { root: true });
    commit('encounter/SET_ACTOR_KEY', { index, value: '' }, { root: true });

    commit('SET_MSG', 'Removed from the cloud.');
    commit('SET_ERROR', true);
  },
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
}