import Vue from 'vue';
import Vuex from 'vuex';
import modules from './modules';

import user from '../model/user';

Vue.use(Vuex);

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  state: {
    user,
  },
  mutations: {
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
  modules: modules
});
