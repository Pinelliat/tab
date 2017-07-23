import Vue from 'vue'
import Vuex from 'vuex'
import allRouter from './modules/allRouter'

Vue.use(Vuex)

export default new Vuex.Store({
    modules: {
        allRouter

    },
    state: {
        count: 0
    },
    mutations: {
        increment (state) {
            state.count++
        }
    }
})