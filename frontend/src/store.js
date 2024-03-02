import { createStore } from 'vuex';

export default createStore({
  state: {
    user: null,
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
    },
    logout(state) {
      state.user = null;
    }
  },
  actions: {
    async login({ commit }, credentials) {
      const response = await fetch('http://localhost:3001/session', {
        method: 'POST',
        body: JSON.stringify(credentials),
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.status === 201) {
        const user = await response.json();
        commit('setUser', user);
      }
    },
    async logout({ commit }) {
      const response = await fetch('http://localhost:3001/session', {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        commit('logout');
      }
    }
  },
  getters: {
    isLoggedIn: state => !!state.user,
    user: state => state.user
  }
});