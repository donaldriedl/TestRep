<template>
  <v-app-bar color="primary">
    <router-link to="/" exact>
      <v-btn id="menu-btn" icon="mdi-menu" color="background" />
    </router-link>
    <v-app-bar-title> TestRep </v-app-bar-title>
    <v-btn id="dark-light-btn" icon="mdi-theme-light-dark" @click="swapTheme" />
    <v-menu>
      <template v-slot:activator="{ props }" >
        <v-btn id="account-btn" icon="mdi-account-circle" v-bind="props" />
      </template>
      <v-list>
        <v-list-subheader> {{ user.email }}</v-list-subheader>
        <v-list-item link>
          <template v-slot:append>
            <v-icon>mdi-account</v-icon>
          </template>
          <v-list-item-title> Account </v-list-item-title>
        </v-list-item>
        <v-divider />
        <v-list-item link @click="logout">
          <template v-slot:append>
            <v-icon>mdi-logout</v-icon>
          </template>
          <v-list-item-title> Logout </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

<script setup>
  import { ref } from 'vue';
  import { useStore } from 'vuex';
  import { useTheme } from 'vuetify';
  import { useRouter } from 'vue-router';
import { onMounted } from 'vue';

  const store = useStore();
  const theme = useTheme();
  const router = useRouter();
  let user = ref({});

  onMounted(() => {
    checkSession();
  });

  async function checkSession() {
    fetch('http://localhost:3001/session', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    }).then(response => {
      if (response.status !== 200) {
        router.push('/login');
      } else {
        return response.json();
      }
    }).then(data => {
      store.commit('setUser', data);
      router.push('/dashboard');
    }).catch(error => {
      console.error('Error:', error);
    });
  }

  function swapTheme() {
    theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
  }

  function logout() {
    fetch('http://localhost:3001/session', {
      method: 'DELETE',
      credentials: 'include'
    }).then(response => {
      if (response.status === 200) {
        router.push('/login');
      }
    });
  }
</script>
