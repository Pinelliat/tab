<template>

  <div class="router-tabs" :style="{height, width}">

    <div :class="['router-tabs-bar', {'router-tabs-bar-scroll':showScrollTrigger}]">
      <div class="router-tabs-scroll-view">
        <ul ref="tabsWrap" class="router-tabs-wrap"
            :style="{transform:'translateX('+(-scrollLeft)+'px)'}">
          <li v-for="tab in currentTabs"
              :class="['router-tabs-item', {'router-tabs-active':tab.fullPath===activePath}]"
              @click="toggleTab(tab)">
            <div class="router-tabs-align-mid">{{tab.meta.title}}</div>
            <span class="router-tabs-close"
                  v-if="tab.meta.closeable"
                  @click.stop="removeTab(tab)">&#215;
          </span>
          </li>
        </ul>
      </div>
      <template v-if="showScrollTrigger">
        <span class="router-tabs-scroll-prev"
              @click="scrollWithDelta(-150)"></span>
        <span class="router-tabs-scroll-next"
              @click="scrollWithDelta(150)"></span>
      </template>
    </div>

    <div class="router-tabs-panel" :style="{overflowX,overflowY}">

      <keep-alive :include="keepAliveTabs">
        <slot>
          <router-view></router-view>
        </slot>
      </keep-alive>

    </div>

  </div>

</template>

<script>

  const toLowerCase = (obj) => typeof obj === 'string' ? obj.toLowerCase() : obj;

  export default {
    name: 'RouterTabs',
    props: {
      /**
       * 控件总高度。
       */
      height: {
        type: String,
        'default': '800px'
      },
      /**
       * 控件总宽度。
       */
      width: {
        type: String,
        'default': '100%'
      },
      overflowX: {
        type: String,
        'default': 'hidden'
      },
      overflowY: {
        type: String,
        'default': 'auto'
      },
      /**
       * 初始化标签的路由数组。
       */
      initTabs: {
        type: Array,
        'default': () => [{
          /**
           * 定义路由名称。
           */
          name: '/',
          /**
           * 定义路由路径。
           */
          path: '/',
          /**
           * 定义路由元信息，辅助设置标签属性。
           */
          meta: {
            /**
             * 标签名，覆盖路由名称时使用。
             */
            title: '欢迎页',
            /**
             * 是否可以关闭该路由标签。
             * 默认是可以关闭的。
             */
            closeable: false,
            /**
             * 是否在未关闭该标签时缓存该路由标签的状态。
             * 默认开启缓存。
             */
            keepAlive: true
          }
        }]
      }
    },
    data() {
      let routes = this.initTabs,
        route = this.$route,
        currentTabs, keepAliveTabs;
      if (Array.isArray(routes)) {
        if (!routes.some(item => toLowerCase(item.name) === toLowerCase(route.name)
            || toLowerCase(item.path) === toLowerCase((route.fullPath || route.path)))) {
          routes.push(route);
        }
      } else {
        routes = [route];
      }
      currentTabs = this.initTabsMeta(routes);
      keepAliveTabs = currentTabs
        .filter(tab => tab.component.name && tab.meta.keepAlive)
        .map(tab => tab.component.name);
      return {
        currentTabs,
        keepAliveTabs,
        activeTab: route,
        showScrollTrigger: false,
        scrollLeft: 0
      }
    },
    watch: {
      currentTabs(curr, prev) {
        this.resize({autoScroll: curr.length > prev.length});
        this.scrolling = true;
        this.$nextTick(() => {
          this.keepAliveTabs = curr.filter(tab => tab.component.name && tab.meta.keepAlive)
            .map(tab => tab.component.name);
        });
      }
    },
    computed: {
      activePath() {
        return toLowerCase(this.activeTab.fullPath || '');
      }
    },
    created() {
      this.$router.afterEach(route => {
        if (!this.isDestroyed) {
          let name = toLowerCase(route.name),
            path = toLowerCase(route.fullPath);
          if (name || path) {
            let tabs = this.currentTabs;
            if (!tabs.some(tab => toLowerCase(tab.name) === name
                || toLowerCase(tab.fullPath) === path)) {
              this.getComponentName(route, (componentName) => {
                this.currentTabs = this.initTabsMeta([...tabs, {
                  ...route,
                  component: {name: componentName}
                }]);
                this.activeTab = route;
                this.scrollToView();
              });
              return;
            }
          }
          this.activeTab = route;
          this.scrollToView();
        }
      });
      window.addEventListener('resize', this.resizeHandler = () => {
        this.resize();
      });
    },
    beforeDestroy() {
      if (this.resizeHandler) {
        window.removeEventListener('resize', this.resizeHandler);
        this.resizeHandler = null;
      }
    },
    destroyed() {
      this.isDestroyed = true;
    },
    methods: {
      //
      getUniqueName() {
        return (+new Date + Math.ceil(Math.random() * 10e6)).toString(36);
      },
      //
      getComponentName(route, callback) {
        let matched = route.matched,
          key, component, componentName;
        if (Array.isArray(matched)) {
          if (matched = matched[0]) {
            if (matched = matched.components) {
              if (!(component = matched[key = 'default'])) {
                component = matched[key = Object.keys(matched)[0]];
              }
              if (typeof component === 'object') {
                if (!(componentName = component.name)) {
                  componentName = component.name = this.getUniqueName();
                }
              } else if (typeof component === 'function') {
                let asyncResolver = component;
                matched[key] = (...args) => {
                  let res = asyncResolver(...args);
                  if (res && typeof res.then === 'function') {
                    return res.then((component) => {
                      if (typeof component === 'object') {
                        if ((componentName = component.name) === void 0) {
                          componentName = component.name = this.getUniqueName();
                        }
                      }
                      callback(componentName);
                      return component;
                    });
                  } else if (typeof res === 'object') {
                    if ((componentName = res.name) === void 0) {
                      componentName = res.name = this.getUniqueName();
                    }
                  }
                  callback(componentName);
                  return res;
                };
                return;
              }
            }
          }
        }
        callback(componentName);
      },
      // 初始化标签参数
      initTabsMeta(tabs) {
        let i = Array.isArray(tabs) ? tabs.length : 0,
          specials = [],
          meta = {
            title: '',
            closeable: true,
            keepAlive: true
          }, tab;
        while (i--) {
          tab = tabs[i];
          if (typeof tab !== 'object'
            || (tab.name === void 0 && tab.fullPath === void 0)
            || ((tab.component || {}).name === void 0)) {
            tabs.splice(i, 1);
          } else {
            tabs.splice(i, 1, tab = {
              name: toLowerCase(tab.name),
              path: toLowerCase(tab.path || tab.fullPath),
              fullPath: toLowerCase(tab.fullPath || tab.path),
              component: {
                name: (tab.component || {}).name
              },
              meta: {...meta, ...tab.meta, title: tab.meta.title || tab.name}
            });
            if (!tab.meta.closeable) {
              specials.unshift(tab);
              tabs.splice(i, 1);
            }
          }
        }
        return specials.concat(Array.isArray(tabs) ? tabs : []);
      },
      //
      scrollToView() {
        if (!this.scrolling && this.showScrollTrigger) {
          this.$nextTick(() => {
            let wrap = this.$refs.tabsWrap,
              activeTabElement = wrap.querySelector('.router-tabs-active'),
              relativeLeft, scrollLeft, viewWidth, targetLeft, delta;
            if (activeTabElement) {
              relativeLeft = activeTabElement.getBoundingClientRect().left - wrap.getBoundingClientRect().left;
              scrollLeft = this.scrollLeft;
              viewWidth = wrap.offsetWidth;
              targetLeft = relativeLeft + activeTabElement.offsetWidth;
              if (scrollLeft + viewWidth < targetLeft) {
                delta = targetLeft - viewWidth - scrollLeft + 4;
              } else if (scrollLeft > relativeLeft) {
                delta = relativeLeft - scrollLeft - 4;
              }
              if (delta) {
                this.scrollWithDelta(delta);
              }
            }
          });
        } else {
          this.scrolling = false;
        }
      },
      //
      scrollWithDelta(delta) {
        if (this.showScrollTrigger) {
          let wrap = this.$refs.tabsWrap;
          this.scrollLeft = Math.min(wrap.scrollWidth - wrap.offsetWidth + 2,
            Math.max(this.scrollLeft + delta, -2))
        }
        return this;
      },
      // 调节大小
      resize(rect) {
        let {width, height} = rect || {};
        if (width !== void 0) {
          this.width = width;
        }
        if (height !== void 0) {
          this.height = height;
        }
        this.$nextTick(() => {
          let refs = this.$refs,
            wrap = refs.tabsWrap;
          if (this.showScrollTrigger = wrap.scrollWidth > wrap.offsetWidth) {
            this.$nextTick(() => {
              this.scrollWithDelta((rect && rect.autoScroll) ? wrap.scrollWidth : 0);
            });
          } else {
            this.scrollLeft = 0;
          }
        });
      },
      // 新增标签
      appendTab(tab) {
        if (tab) {
          this.$router.push(tab);
        }
        return this;
      },
      // 移除标签
      removeTab(tab) {
        if (tab && (tab.name || tab.fullPath)) {
          let name = toLowerCase(tab.name),
            path = toLowerCase(tab.fullPath),
            tabs = this.currentTabs,
            next = this.activeTab;
          for (let i = 0; i < tabs.length; i++) {
            tab = tabs[i];
            if (toLowerCase(tab.name) === name || toLowerCase(tab.fullPath) === path) {
              tabs.splice(i, 1);
              if (toLowerCase(next.name) === name || toLowerCase(next.fullPath) === path) {
                next = tabs[i] || tabs[tabs.length - 1];
              }
              break;
            }
          }
          path = next ? toLowerCase(next.fullPath || next.path) : '';
          this.$router.push(path ? {path} : toLowerCase((next || {name: ''}).name));
        }
        return this;
      },
      // 切换标签
      toggleTab(tab) {
        if (tab && (tab.name || tab.path)) {
          let path = toLowerCase(tab.fullPath || tab.path);
          this.$router.push(path ? {path} : toLowerCase(tab.name));
        }
        return this;
      }
    }

  }


</script>

<style scoped>

  .router-tabs {
    position: relative;
  }

  .router-tabs-bar {
    height: 44px;
    width: 100%;
    background-color: #f6f6f6;
    border-bottom: 1px solid #ddd;
    box-sizing: border-box;
    transition: padding .3s;
  }

  .router-tabs-scroll-view {
    width: 100%;
    overflow: hidden;
  }

  .router-tabs-wrap {
    list-style: none;
    margin: 0;
    padding: 0;
    border: 0;
    display: block;
    height: 44px;
    width: 100%;
    box-sizing: border-box;
    position: relative;
    overflow: visible;
    transition: transform .3s;
  }

  .router-tabs-panel {
    position: absolute;
    width: 100%;
    left: 0;
    top: 44px;
    bottom: 0;
  }

  .router-tabs-item {
    display: inline-block;
    padding: 5px 16px;
    cursor: pointer;
    border: 1px solid #ddd;
    margin: 10px 2px 0 2px;
    border-top-left-radius: 6px;
    border-top-right-radius: 6px;
  }

  .router-tabs-item:first-child {
    margin-left: 4px;
  }

  .router-tabs-close {
    width: 0.9em;
    height: 0.9em;
    line-height: 0.9em;
    vertical-align: middle;
    text-align: center;
    box-sizing: border-box;
    display: inline-block;
    border-radius: 50%;
    transition: background-color .3s, color .3s;
    position: relative;
  }

  .router-tabs-close:hover {
    background-color: #ddd;
    color: #fff;
  }

  .router-tabs-align-mid {
    display: inline-block;
    vertical-align: middle;
  }

  .router-tabs-align-mid,
  .router-tabs-wrap {
    white-space: nowrap;
    word-break: keep-all;
  }

  .router-tabs-item:hover,
  .router-tabs-active {
    color: #20a0ff;
  }

  .router-tabs-active {
    background-color: #fff;
    border-bottom-color: #fff;
  }

  .router-tabs-bar-scroll {
    padding: 0 20px;
  }

  .router-tabs-scroll-prev,
  .router-tabs-scroll-next {
    position: absolute;
    width: 24px;
    height: 44px;
    top: 0;
    background-color: #f6f6f6;
    border-bottom: 1px solid #ddd;
    box-sizing: border-box;
    cursor: pointer;
  }

  .router-tabs-scroll-prev:hover:after,
  .router-tabs-scroll-next:hover:after {
    border-color: #20a0ff;
  }

  .router-tabs-scroll-prev {
    left: 0;
  }

  .router-tabs-scroll-next {
    right: 0;
  }

  .router-tabs-scroll-prev:after,
  .router-tabs-scroll-next:after {
    content: '';
    display: block;
    border: 2px solid #ddd;
    border-right-width: 0;
    border-bottom-width: 0;
    width: 10px;
    height: 10px;
    transform: rotate(-45deg) translate(-2px, -2px);
    position: absolute;
    top: 50%;
    left: 50%;
    transition: border .3s;
  }

  .router-tabs-scroll-next:after {
    transform: rotate(135deg) translate(6px, 6px);
  }

</style>
