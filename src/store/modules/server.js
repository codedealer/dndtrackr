import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import config from '../../config';
import ActorClass from '../../model/actor';
import SpellClass from '../../model/spell';
import DataDecorator from '../../utils/serverDecorator';

import { merge } from 'lodash-es';

const state = {
  errorMsg: '',
  error: false,
  userLoading: false,
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
  SET_USER_LOADING (state, value) {
    state.userLoading = value;
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
        commit('SET_USER_LOADING', true);
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
            if (userData.spells) {
              commit('data/SET_USER_SPELL_INDEX', Object.values(userData.spells), { root: true });
            }
            if (userData.feats) {
              commit('data/SET_USER_INDEX', {
                property: 'userFeatIndex',
                value: Object.values(userData.feats)
              }, { root: true });
            }
          }
        } catch (e) {
          console.error(e);
          commit('SET_MSG', 'Error downloading user index.');
          commit('SET_ERROR', true);
        }

        commit('SET_USER_LOADING', false);
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
    try {
      const response = await fetch('/data/spell_index.json');
      const spellIndex = await response.json();

      commit('data/SET_SPELL_INDEX', spellIndex, { root: true });
    } catch (e) {
      commit('SET_MSG', 'Error downloading spell index.');
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
      commit('encounter/RESET_ACTOR', {
        index,
        save: {
          type: actor.type,
          name: actor.name,
          key: actor.key,
        }
      }, { root: true });

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
  async getSpell ({ rootState, commit, dispatch }, item) {
    if (rootState.data._userSpellIndex.some(a => a.key === item.key)) {
      try{
        const snap = await firebase
                    .database()
                    .ref(`userData/${rootState.user.uid}/spells/${item.key}`)
                    .once('value');
        if (!snap.exists()) {
          commit('SET_MSG', `No data for ${item.name}`);
          commit('SET_ERROR', true);
          return;
        }

        const spellData = snap.val();
        // data normalization
        const spell = merge(new SpellClass(), spellData);
        commit('spells/SET_SPELL', spell, { root: true });
      } catch (e) {
        commit('SET_MSG', e.message || 'Cannot get data for ' + item.name);
        commit('SET_ERROR', true);
        return;
      }
    } else {
      await dispatch('getSpellRemote', item);
    }
  },
  async getSpellRemote ({ state, rootState, commit }, item) {
    let results;
    try {
      results = await open5eAPI('spells', { name__iexact: item.name });
    } catch (e) {
      commit('SET_MSG', e.message || 'Cannot get data for ' + item.name);
      commit('SET_ERROR', true);
      return;
    }

    if (!results.length) {
      commit('SET_MSG', 'No data for ' + item.name);
      commit('SET_ERROR', true);
      return;
    }

    const spellData = results[0];
    // data normalization
    spellData['dnd_class'] = spellData.dnd_class.split(',').map(t => t.trim());
    const spell = merge(new SpellClass(), { data: spellData });
    spell.key = 'open5eAPI';
    commit('spells/SET_SPELL', spell, { root: true });
  },
  async saveSpell ({ state, rootState, commit }, spell) {
    if (!spell.data.name.length) {
      commit('SET_MSG', 'Name cannot be empty.');
      commit('SET_ERROR', true);
      return;
    }
    commit('spells/SET_DIRTY', false, { root: true });

    let key = spell.key;
    let isNew = false;
    if (!key) {
      // new stuff
      isNew = true;
      const indexRef = firebase.database().ref(`userIndex/${rootState.user.uid}/spells`).push();
      key = indexRef.key;
    }

    const spellIndex = DataDecorator.getSpellIndex(spell, rootState.user.uid, key);
    const spellPayload = DataDecorator.getSpellPayload(spell, key);
    const rootRef = firebase.database().ref();
    const updatePayload = {
      [`userIndex/${rootState.user.uid}/spells/${key}`]: spellIndex,
      [`userData/${rootState.user.uid}/spells/${key}`]: spellPayload,
    }

    try {
      await rootRef.update(updatePayload);
    } catch (e) {
      commit('SET_MSG', e.message || 'Error. Couldn\'t save.');
      console.error(e);
      commit('SET_ERROR', true);
      commit('spells/SET_DIRTY', true, { root: true });
      return;
    }

    commit('spells/SET_KEY', key, { root: true });
    if (isNew) {
      // add the new spell to the index
      commit('data/PUSH_USER_SPELL_INDEX', spellIndex, { root: true });
    } else {
      // update index information
      commit('data/UPDATE_USER_SPELL_INDEX', spellIndex, { root: true });
    }

    commit('SET_MSG', 'Saved.');
    commit('SET_ERROR', true);
  },
  async forkSpell ({ commit, dispatch }, spell) {
    // reset the key and save as a new spell
    commit('spells/SET_KEY', '', { root: true });
    await dispatch('saveSpell', spell);
  },
  async removeSpell ({ state, rootState, commit }, spell) {
    const key = spell.key;
    const rootRef = firebase.database().ref();
    const updatePayload = {
      [`userIndex/${rootState.user.uid}/spells/${key}`]: null,
      [`userData/${rootState.user.uid}/spells/${key}`]: null,
    }

    try {
      await rootRef.update(updatePayload);
    } catch (e) {
      commit('SET_MSG', e.message || 'Error. Couldn\'t remove.');
      console.error(e);
      commit('SET_ERROR', true);
      return;
    }

    commit('data/REMOVE_USER_SPELL_INDEX', spell, { root: true });
    commit('spells/SET_SPELL', false, { root: true });

    commit('SET_MSG', 'Removed from the cloud.');
    commit('SET_ERROR', true);
  },
  async saveFeat ({ state, commit, rootState }, feat) {
    if (!feat.name || !feat.content) {
      commit('SET_MSG', 'Feat cannot be empty.');
      commit('SET_ERROR', true);
      throw new Error('Feat cannot be empty.');
    }

    let key = feat.key;
    let isNew = false;
    if (!key) {
      // new stuff
      isNew = true;
      const indexRef = firebase.database().ref(`userIndex/${rootState.user.uid}/feats`).push();
      key = indexRef.key;
    }

    const featIndex = DataDecorator.getFeatIndex(feat, rootState.user.uid, key);
    // it's the same
    const featPayload = DataDecorator.getSpellPayload(feat, key);
    const rootRef = firebase.database().ref();
    const updatePayload = {
      [`userIndex/${rootState.user.uid}/feats/${key}`]: featIndex,
      [`userData/${rootState.user.uid}/feats/${key}`]: featPayload,
    }

    try {
      await rootRef.update(updatePayload);
    } catch (e) {
      commit('SET_MSG', e.message || 'Error. Couldn\'t save.');
      commit('SET_ERROR', true);
      throw e;
    }

    const indexObject = {
      property: 'userFeatIndex',
      value: featIndex
    };

    if (isNew) {
      // add the new spell to the index
      commit('data/PUSH_USER_INDEX', indexObject, { root: true });
    } else {
      // update index information
      commit('data/UPDATE_USER_INDEX', indexObject, { root: true });
    }

    commit('SET_MSG', 'Saved.');
    commit('SET_ERROR', true);
  },
  async getFeat ({ commit, rootState, dispatch }, { indexObject, featObject }) {
    if (!indexObject.key) {
      commit('SET_MSG', 'Feat cannot be empty.');
      commit('SET_ERROR', true);
      throw new Error('Feat cannot be empty.');
    }

    try {
      const snap = await firebase
                .database()
                .ref(`userData/${rootState.user.uid}/feats/${indexObject.key}`)
                .once('value');
      if (!snap.exists()) {
        commit('SET_MSG', `No data for ${indexObject.name}`);
        commit('SET_ERROR', true);
        throw new Error(`No data for ${indexObject.name}`);
      }

      const featData = snap.val();
      // data normalization
      const feat = merge(featObject, featData);
      dispatch('feats/loadFeat', feat, { root: true });
    } catch (e) {
      commit('SET_MSG', e.message || 'Cannot get data for ' + indexObject.name);
      commit('SET_ERROR', true);
      throw e;
    }
  },
  async removeFeat ({ commit, rootState, dispatch }, { indexObject }) {
    if (!indexObject.key) return;

    const key = indexObject.key;
    const rootRef = firebase.database().ref();
    const updatePayload = {
      [`userIndex/${rootState.user.uid}/feats/${key}`]: null,
      [`userData/${rootState.user.uid}/feats/${key}`]: null,
    }

    try {
      await rootRef.update(updatePayload);
    } catch (e) {
      commit('SET_MSG', e.message || 'Error. Couldn\'t remove.');
      console.error(e);
      commit('SET_ERROR', true);
      throw e;
    }

    commit('data/REMOVE_USER_INDEX', {
      property: 'userFeatIndex',
      value: indexObject
    }, { root: true });

    commit('SET_MSG', 'Removed from the cloud.');
    commit('SET_ERROR', true);
  },
}

async function open5eAPI (path, params) {
  const url = new URL(path, 'https://api.open5e.com');
  const searchParams = new URLSearchParams(params);
  const dest = `${url.toString()}?${searchParams.toString()}`;

  const response = await fetch(dest, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) throw new Error('Fetch to remote api failed');

  const data = await response.json();

  return data.results;
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
}