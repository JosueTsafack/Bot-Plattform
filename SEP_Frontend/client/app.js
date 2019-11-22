import Vue from 'vue'
import { sync } from 'vuex-router-sync'
import App from './components/App.vue'
import router from './router'
import store from './store'
import Vuetify from 'vuetify'
import Raven from 'raven-js';
import RavenVue from 'raven-js/plugins/vue';

Raven
  .config('https://39f62294488a4ba1a0e8155abeb73d31@sentry.io/254430')
  .addPlugin(RavenVue, Vue)
  .install();

var VueCookie = require('vue-cookie')

Vue.use(Vuetify, {
  theme: {
    primary: '#ff720b',
    secondary: '#f8bc16',
    accent: '#8c9eff',
    error: '#b71c1c'
  }
})

Vue.use(VueCookie)

sync(store, router)

const app = new Vue({
  router,
  store,
  ...App
})

export { app, router, store }
