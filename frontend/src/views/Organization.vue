<template>
  <v-container class="fill-height">
    <v-responsive class="d-flex align-top text-center fill-height">
      <template v-if="orgDataLoaded">
        <v-card class="my-8" elevation="4" style="position: relative;">
          <v-btn
          style="position: absolute; top: 0; right: 0; background: none;"
          text
          elevation="0"
          size="50"
          :ripple="false"
          @click="showSettings = !showSettings">
            <v-icon color="white" size="30">mdi-cog</v-icon>
          </v-btn>
          <v-dialog v-model="showSettings" max-width="350">
            <v-card>
              <v-card-title>Organization Settings</v-card-title>
              <v-select
                v-model="defaultOrg"
                :items="orgNames"
                label="Primary Organization"
                class="mx-4"
              />
              <v-text-field
                label="Organization UUID"
                class="mx-4"
                v-model="orgData.find(org => org.organizationName === defaultOrg).organizationUuid"
                filled
                :readonly="true"
                append-inner-icon="mdi-content-copy"
                @click:append-inner="copyUuid()" />
              <v-card-actions>
                <v-btn text @click="saveSettings">Save</v-btn>
                <v-btn text @click="showSettings = !showSettings; showOrgJoin = !showOrgJoin">Join Organization</v-btn>
                <v-btn text @click="showSettings = !showSettings">Cancel</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-dialog v-model="showOrgJoin" max-width="350">
            <v-card>
              <v-card-title>Join Organization</v-card-title>
              <v-text-field
                label="Organization UUID"
                class="mx-4"
                v-model="newOrgUuid"
                filled />
              <v-card-actions>
                <v-btn text @click="joinOrganization">Save</v-btn>
                <v-btn text @click="showOrgJoin = !showOrgJoin; showSettings = !showSettings">Cancel</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <Dashboard v-if="testDataLoaded" :test-data="testData" summary-type="Organization" />
          <DataList v-if="repoDataLoaded" :repo-data="repoData" data-type="Repositories" />
        </v-card>
      </template>
    </v-responsive>
  </v-container>
</template>

<script setup>
  import Dashboard from '@/components/Dashboard.vue';
  import DataList from '@/components/DataList.vue';
  import Helpers from '@/helpers.js';
  import { ref, watch } from 'vue';
  import { useStore } from 'vuex';

  const store = useStore();

  const testData = ref({});
  const repoData = ref([]);
  const orgDataLoaded = ref(false);
  const testDataLoaded = ref(false);
  const repoDataLoaded = ref(false);
  const showSettings = ref(false);
  const showOrgJoin = ref(false);
  const newOrgUuid = ref('');
  const orgData = ref([]);
  const orgNames = ref([]);
  const defaultOrg = ref('');

  watch(() => store.getters.isLoggedIn, async (isLoggedIn) => {
    if (isLoggedIn) {
      getOrganizations();
      getOrganizationSummary();
      getOrganizationRepoData();
    }
  }, { immediate: true });

  async function getOrganizations() {
    const response = await fetch('http://localhost:3001/organizations', {
      method: 'GET',
      credentials: 'include'
    });

    if (Helpers.validateResponse(response)) {
      const data = await response.json();
      orgData.value = data;
      orgNames.value = data.map(org => org.organizationName);
      const orgId = store.getters.user.defaultOrgId;
      defaultOrg.value = data.find(org => org.id === orgId).organizationName;
      orgDataLoaded.value = true;
    } else {
      store.commit('showError', 'Error retrieving organizations')
    }
  }

  async function getOrganizationSummary() {
    const response = await fetch('http://localhost:3001/organizations/summary', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    if (Helpers.validateResponse(response)) {
      testData.value = await response.json();
      testDataLoaded.value = true;
    } else {
      store.commit('showError', 'Error retrieving organization summary');
    }
  }

  async function getOrganizationRepoData() {
    const response = await fetch('http://localhost:3001/repos', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    
    if (Helpers.validateResponse(response)) {
      const data = await response.json();
      repoData.value = data;
      repoDataLoaded.value = true;
    } else if (response.status === 404) {
      repoData.value = [];
      repoDataLoaded.value = true;
    } else {
      store.commit('showError', 'Error retrieving repository data');
    }
  }

  function copyUuid() {
    const uuid = orgData.value.find(org => org.organizationName === defaultOrg.value).organizationUuid;
    navigator.clipboard.writeText(uuid);
  }

  async function saveSettings() {
    const orgId = orgData.value.find(org => org.organizationName === defaultOrg.value).id;
    const response = await fetch(`http://localhost:3001/organizations/${orgId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });

    if (Helpers.validateResponse(response)) {
      store.commit('setUser', { defaultOrgId: orgId });
      showSettings.value = false;
      window.location.reload();
    } else {
      store.commit('showError', 'Error saving organization settings');
    }
  }

  async function joinOrganization() {
    const response = await fetch('http://localhost:3001/organizations/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ organizationUuid: newOrgUuid.value })
    });

    if (Helpers.validateResponse(response)) {
      showOrgJoin.value = false;
      window.location.reload();
    } else {
      store.commit('showError', 'Error joining organization');
    }
  }
</script>
