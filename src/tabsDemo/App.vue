<template>
  <div style="padding: 20px;height: 100%; box-sizing: border-box">

    <div style="height:20%">

      <!-- 使用API方法添加Tab -->
      <div style="padding: 10px">
        <button @click="appendTab('TabA')">添加TabA</button>
        <button @click="appendTab('/TabB')">添加TabB</button>
        <button @click="appendTab({path:'/tabc'})">添加TabC</button>
      </div>

      <!-- 通过更新路由状态来添加Tab -->
      <div style="padding: 10px 10px 20px 10px">
        <router-link to="/taba">添加TabA</router-link>
        <router-link to="TabB">添加TabB</router-link>
        <router-link :to="{path:'/tabc'}">添加TabC</router-link>
      </div>

    </div>

    <!-- 外层布局好后，将RouterTabs方在布局容器内，并设置组件height为100%来自适应容器 -->
    <!-- initTabs设置初始时就要显示的tab，可以设置多个，其内容为类似于route对象的数组 -->
    <RouterTabs ref="tabs"
                :initTabs="defaultTabs"
                height="70%"
    >
      <!-- 覆盖内部默认的slot -->
        <router-view></router-view>
    </RouterTabs>
  </div>
</template>
<script>


  import Vue from 'vue';

  import router from './router';
  import RouterTabs from './RouterTabs.vue';
  import store from './store/index.js';

  export default {
    name: 'app',
    components: {RouterTabs},
    data() {
      return {
        defaultTabs: [{
          name: '首页界面',
          path: '/Home',
          component: {
            name: 'Home'
          },
          meta: {
            //  title会覆盖name
            title: '欢迎页',
            //  下面两个参数默认为true
            closeable: false,
            keepAlive: false
          }
        }]
      }
    },
    methods: {
      appendTab(tab) {
        //  通过调用API的形式来添加Tab，实际上方法内部也是触发路由的更新
        this.$refs.tabs.appendTab(tab);
      }
    }
  }
</script>

<style>
  html, body {
    height: 100%;
    width: 100%;
    padding: 0;
    margin: 0;
  }
</style>
