import Vue from 'vue'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import App from './App.vue';
import locale from 'element-ui/lib/locale/lang/en';
import VueSimpleContextMenu from 'vue-simple-context-menu';

Vue.component('vue-simple-context-menu', VueSimpleContextMenu);
Vue.config.productionTip = false;
Vue.use(ElementUI, { locale });
Vue.use(ElementUI);

new Vue({
  render: h => h(App),
}).$mount('#app');
