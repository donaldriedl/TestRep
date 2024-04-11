<template>
  <v-main>
    <router-view />
    <v-snackbar v-model="snackbar.show" :color="snackbar.color">{{ snackbar.message }}</v-snackbar>
  </v-main>
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const snackbar = computed(() => store.state.snackbar);
</script>
