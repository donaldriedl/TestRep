<template>
  <v-container class="fill-height">
    <v-responsive class="align-center text-center fill-height">
      <v-card class="mx-auto" max-width="400" elevation="4">
        <v-card-title class="bg-secondary"> Login </v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <v-text-field v-model="emailField" label="Email" type="email" variant="underlined" />
          <v-text-field v-model="passwordField" label="Password" type="password" variant="underlined" />
          <v-card-actions>
            <v-btn color="primary" @click="login"> Login </v-btn>
            <v-btn color="primary" @click="navRegister"> Register </v-btn>
          </v-card-actions>
        </v-card-text>
      </v-card>
    </v-responsive>
    <v-snackbar v-model="snackbar" color="error">{{ snackbarMessage }}</v-snackbar>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const emailField = ref('');
const passwordField = ref('');
const snackbar = ref(false);
const snackbarMessage = ref('');

const login = () => {
  if (!emailField.value || !passwordField.value) {
    snackbar.value = true;
    snackbarMessage.value = 'Email and password are required';
    return;
  }

  fetch('http://localhost:3001/session', {
    method: 'POST',
    body: JSON.stringify({
      email: emailField.value,
      password: passwordField.value
    }),
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  }).then(response => {
    if (response.status === 201) {
      router.push('/dashboard');
    } else {
      snackbar.value = true;
      snackbarMessage.value = 'Invalid email or password';
      passwordField.value = '';
    }
  });
};

const navRegister = () => {
  router.push('/register');
};
  
</script>
