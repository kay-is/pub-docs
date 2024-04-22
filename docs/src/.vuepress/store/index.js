import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    isLight: false,
    isSearchModalOpen: false,
  },
  mutations: {
    openSearchModal(state) {
      // console.log("opening modal")
      state.isSearchModalOpen = true;
    },
    closeSearchModal(state) {
      // console.log("closing modal")
      state.isSearchModalOpen = false;
    },
    toggleLightMode(state) {
      state.isLight = !state.isLight;
    },
  },
});
