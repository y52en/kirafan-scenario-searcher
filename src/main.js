import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import router from "./router";
import axios from "axios";
import localforage from "localforage";

Vue.config.productionTip = false
Vue.prototype.$window = window

new Vue({
  vuetify,
  router,
  axios,
  localforage,
  render: h => h(App)
}).$mount('#app')
