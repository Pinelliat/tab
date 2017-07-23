import Vue from 'vue';
import Router from 'vue-router';

import TabA from './TabA.vue';
import TabB from './TabB.vue';
import TabC from './TabC.vue';


import Home from './Home.vue';

Vue.use(Router);

export default new Router({
  routes: [{
    path: '/',
    name: '/',
    redirect: '/home'
  }, {
    path: '/home',
    name: '首页',
    component: Home
  }, {
    path: '/taba',
    name: '标签A',
    component: TabA
  }, {
    path: '/tabb',
    name: '标签B',
    component: TabB,
    meta: {
      // 在此处设置标签属性信息
      keepAlive: false,
      closeable: false
    }
  }, {
    path: '/tabc',
    name: '标签C',
    component: TabC,
    meta: {
      // 在此处设置标签属性信息
      title: '我是大标签C啊'
    }
  }]
});
