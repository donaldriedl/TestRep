<template>
  <v-container class="fill-height">
    <v-responsive class="align-center text-center fill-height">
      <v-card class="mx-auto" max-width="400" elevation="4">
        <v-card-title class="bg-secondary"> Login </v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <v-text-field v-model="emailField" label="Email" type="email" variant="underlined" autofocus />
          <v-text-field v-model="passwordField" label="Password" type="password" variant="underlined" />
          <v-card-actions>
            <v-btn color="primary" @click="login"> Login </v-btn>
            <v-btn color="primary" @click="navRegister"> Register </v-btn>
          </v-card-actions>
        </v-card-text>
      </v-card>
    </v-responsive>
  </v-container>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

const store = useStore();

const router = useRouter();
const emailField = ref('');
const passwordField = ref('');

const handleKeyPress = (event) => {
  if (event.key === 'Enter' && emailField.value && passwordField.value) {
    login();
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleKeyPress);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyPress);
});

const login = () => {
  if (!emailField.value || !passwordField.value) {
    store.commit('showError', 'Please enter an email and password');
    return;
  }

  store.dispatch('login',
    {
      email: emailField.value,
      password: passwordField.value
    }
  ).then(() => {
    router.push('/dashboard');
  }).catch(() => {
    store.commit('showError', 'Invalid email or password');
    return;
  })
};

const navRegister = () => {
  router.push('/register');
};
  
</script>
