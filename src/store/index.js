import Vue from 'vue';
import Vuex from 'vuex';
import VuexPersistence from 'vuex-persist';
import localForage from 'localforage';

import modules from './modules';

import user from '../model/user';

Vue.use(Vuex);

const vuexLocal = new VuexPersistence({
  strictMode: process.env.NODE_ENV !== 'production',
  storage: localForage,
  asyncStorage: true,
  reducer: (state) => {
    // filter out data module before saving
    const { data, ...rest } = state;
    return rest;
  },
});

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  state: {
    user,
  },
  mutations: {
    RESTORE_MUTATION: vuexLocal.RESTORE_MUTATION,
    UPDATE_USER (state, user) {
      if (!user) {
        state.user.state = false;
      } else {
        state.user.state = true;
        state.user.displayName = user.displayName || 'unnamed';
        state.user.photo = user.photoURL;
        state.user.uid = user.uid;
      }
    }
  },
  actions: {},
  modules: modules,
  plugins: [vuexLocal.plugin]
});
