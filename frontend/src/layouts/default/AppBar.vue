<template>
  <v-app-bar color="primary" class="d-flex">
    <div style="flex-grow: 1;">
      <v-img
        src="@/assets/testrep-logo.png"
        alt="TestRep Logo"
        height="50px"
        width="100px"
        class="mr-4 cursor-pointer"
        @click="router.push('/dashboard')" />
    </div>
    <v-btn id="dark-light-btn" icon="mdi-theme-light-dark" @click="swapTheme" />
    <v-menu>
      <template v-slot:activator="{ props }">
        <v-btn id="account-btn" icon="mdi-account-circle" v-bind="props" />
      </template>
      <v-list>
        <v-list-subheader>{{ store.getters.user.email }}</v-list-subheader>
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
  import { useTheme } from 'vuetify';
  import { useRouter } from 'vue-router';
  import { useStore } from 'vuex';

  const theme = useTheme();
  const router = useRouter();
  const store = useStore();

  function swapTheme() {
    theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
  }

  function logout() {
    store.dispatch('logout').then(() => {
      router.push('/login');
    });
  }
</script>
