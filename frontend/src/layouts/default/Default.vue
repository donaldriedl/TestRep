<template>
  <v-app id="testRepApp">
    <default-bar 
      v-if="store.getters.isLoggedIn"
    />

    <default-view />
  </v-app>
</template>

<script setup>
  import DefaultBar from './AppBar.vue'
  import DefaultView from './View.vue'
  import Helpers from '@/helpers.js'
  import { useStore } from 'vuex'
  import { useRouter } from 'vue-router'
  import { onMounted } from 'vue'

  const router = useRouter()
  const store = useStore()

  onMounted(() => {
    checkSession()
  })

  async function checkSession() {
    if (store.getters.isLoggedIn) {
      return;
    }

    const response = await fetch('http://localhost:3001/session', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    if (response.status === 200) {
      const data = await response.json()
      store.commit('setUser', data);
      if (router.currentRoute.value.path === '/') {
        router.push('/dashboard');
      }
    } else {
      router.push('/login');
    }
  }
</script>

<style scoped>
  #testRepApp {
    background-image: linear-gradient(to right, #f5f5f5, #ffffff, #f5f5f5);
  }
</style>
