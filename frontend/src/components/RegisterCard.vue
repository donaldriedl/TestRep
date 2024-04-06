<template>
  <v-container class="fill-height">
    <v-responsive class="align-center text-center fill-height">
      <v-card class="mx-auto" max-width="400" elevation="4">
        <v-card-title class="bg-secondary"> Login </v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <v-text-field v-model="emailField" label="Email" type="email" variant="underlined" />
          <v-text-field v-model="passwordField" label="Password" type="password" variant="underlined" />
          <v-text-field v-model="confirmPasswordField" label="Confirm Password" type="password" variant="underlined" />
          <v-text-field
            v-model="organizationField"
            label="Organization UUID"
            type="text"
            variant="underlined"
            append-icon="mdi-plus"
            @click:append="dialog = !dialog" />
          <v-card-actions>
            <v-btn color="primary" @click="register"> Register </v-btn>
            <v-btn color="primary" @click="cancel"> Cancel </v-btn>
          </v-card-actions>
        </v-card-text>
      </v-card>
    </v-responsive>
    <v-dialog v-model="dialog" max-width="290">
      <v-card>
        <v-card-title class="headline"> Create Organization </v-card-title>
        <v-card-text>
          <v-text-field v-model="createOrgName" label="Organization Name" type="text" variant="underlined" />
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="createOrganization"> Create </v-btn>
          <v-btn color="primary" @click="dialog = false"> Cancel </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snackbar" color="error">{{ snackbarMessage }}</v-snackbar>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const emailField = ref('');
const passwordField = ref('');
const confirmPasswordField = ref('');
const organizationField = ref('');
const snackbar = ref(false);
const snackbarMessage = ref('');

const dialog = ref(false);
const createOrgName = ref('');

const register = () => {
  if (!emailField.value || !passwordField.value || !confirmPasswordField.value || !organizationField.value) {
    snackbar.value = true;
    snackbarMessage.value = 'Email, password, and organization are required';
    return;
  }

  if (passwordField.value !== confirmPasswordField.value) {
    snackbar.value = true;
    snackbarMessage.value = 'Passwords do not match';
    return;
  }


  fetch('http://localhost:3001/register', {
    method: 'POST',
    body: JSON.stringify({
      email: emailField.value,
      password: passwordField.value,
      orgUuid: organizationField.value
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(response => {
    if (response.status === 201) {
      router.push('/login');
    } else if (response.status === 400) {
      snackbar.value = true;
      snackbarMessage.value = 'Email or Organization already exists';
      passwordField.value = '';
    } else {
      snackbar.value = true;
      snackbarMessage.value = 'Unknown error occurred';
      passwordField.value = '';
    }
  });
};

const createOrganization = async () => {
  if (!createOrgName) {
    snackbar.value = true;
    snackbarMessage.value = 'Organization name is required';
    return;
  }

  const response = await fetch('http://localhost:3001/organizations', {
    method: 'POST',
    body: JSON.stringify({
      orgName: createOrgName.value,
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  });
    
  if (response.status === 201) {
    const parsedResponse = await response.json();
    organizationField.value = parsedResponse.uuid;
    dialog.value = false;
  } else {
    snackbar.value = true;
    snackbarMessage.value = 'Unknown error occurred';
  }
};

const cancel = () => {
  router.push('/');
};
</script>
