import { createStore } from 'vuex';
import Helpers from './helpers';

export default createStore({
  state: {
    user: null,
    snackbar: {
      show: false,
      message: '',
      color: '',
    }
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
    },
    logout(state) {
      state.user = null;
    },
    showError(state, message) {
      state.snackbar = {
        show: true,
        message: message,
        color: 'error'
      }
    },
    showWarning(state, message) {
      state.snackbar = {
        show: true,
        message: message,
        color: 'warning'
      }
    },
    hideSnackbar(state) {
      state.snackbar.show = false;
    }
  },
  actions: {
    async login({ commit }, credentials) {
      const response = await fetch('http://localhost:3001/session', {
        method: 'POST',
        body: JSON.stringify(credentials),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (Helpers.validateResponse(response)) {
        const user = await response.json();
        commit('setUser', user);
      } else {
        commit('showError', 'Invalid email or password');
        throw(new Error('Invalid email or password'))
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