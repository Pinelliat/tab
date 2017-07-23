import * as types from '../mutation-types'

const state = {
  routerOptions:[],
  deactivatedFlag:false,
  currentRoute:''
}
const actions = {
  setRouterOptions ({ commit }, obj) {
    commit(types.ROUTER_ALL_ROAD, {obj})
  },
  deleteRouterOptions({ commit },i){
    commit(types.ROUTER_DELETE_ROAD, {i})
  },
  isemitdeactivated({ commit }){
    // console.log('=============================这儿是可以销毁组件')
    commit(types.IS_REMOVE_VUEFLAG)
  },//这儿是可以销毁组件
  isemitdeactivatedfalse({ commit }){
    // console.log('=================================这儿是不可以销毁组件')
    commit(types.IS_REMOVE_VUEF)
  },//这儿是不允许销毁组件
  sureCurrent({ commit }, name){
     commit(types.CURRENT_ROUTE_POS,{name})
  }
}
const mutations = {
    [types.ROUTER_ALL_ROAD] (state, { obj }) {
        var flag = true;
        for(let i =0;i<state.routerOptions.length;i++){
          if(state.routerOptions[i].fullPath == obj.fullPath){
            flag = false;
            break;
          }
        }
        if(flag){
           state.routerOptions.push(obj);
        }  
    },
    [types.ROUTER_DELETE_ROAD](state,{i}){
      state.routerOptions.splice(i,1);
    },
    [types.IS_REMOVE_VUEFLAG] (state){
       state.deactivatedFlag = true;
    },
    [types.IS_REMOVE_VUEF] (state){
       state.deactivatedFlag = false;
    },
    [types.CURRENT_ROUTE_POS](state,{name}){
       state.currentRoute = name;
    }
}
export default {
    state,
    actions,
    mutations
}