import Vue from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import store from './store';
import vuetify from './plugins/vuetify';
import VueHotKey from 'v-hotkey';

Vue.config.productionTip = false;

Vue.use(VueHotKey);

new Vue({
  store,
  vuetify,

  render: function(h) {
    return h(App);
  }
}).$mount('#app');
