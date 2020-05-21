import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    netType : 0,
    netName : "Моя сеть",
    layers : 3
  },
  mutations: {
    setNetType(state, type){
      state.netType = type;
    },
    setNetName(state, name){
      state.netName = name;
    },
    setLayers(state, layers){
      state.layers = layers;
    }
  },
  actions: {
  },
  modules: {
  }
})
