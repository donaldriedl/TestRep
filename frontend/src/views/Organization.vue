<template>
  <v-container class="fill-height">
    <v-responsive class="d-flex align-top text-center fill-height">
      <template v-if="testDataLoaded && repoDataLoaded && orgDataLoaded">
        <v-btn
          style="position: absolute; top: 0; right: 0;"
          text
          elevation="0"
          size="50"
          icon="mdi-cog"
          @click="showSettings = !showSettings"
        />
        <v-dialog v-model="showSettings" max-width="300">
          <v-card>
            <v-card-title>Organization Settings</v-card-title>
            <v-select
              v-model="defaultOrg"
              :items="orgNames"
              label="Primary Organization"
              class="mx-4"
            />
            <v-card-actions>
              <v-btn text @click="saveSettings">Save</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <Dashboard :test-data="testData" summary-type="Organization" />
        <DataList :repo-data="repoData" data-type="Repositories" />
      </template>
    </v-responsive>
  </v-container>
</template>

<script setup>
  import Dashboard from '@/components/Dashboard.vue'
  import DataList from '@/components/DataList.vue'
  import { ref, watchEffect } from 'vue';
  import { useRouter } from 'vue-router';
  import { useStore } from 'vuex';

  const router = useRouter();
  const store = useStore();

  const testData = ref({});
  const repoData = ref({});
  const orgDataLoaded = ref(false);
  const testDataLoaded = ref(false);
  const repoDataLoaded = ref(false);
  const showSettings = ref(false);
  const orgData = ref([]);
  const orgNames = ref([]);
  const defaultOrg = ref('');

  watchEffect(() => {
    if (store.getters.isLoggedIn) {
      getOrganizations();
      getOrganizationSummary();
      getOrganizationRepoData();
    }
  });

  async function getOrganizations() {
    const response = await fetch('http://localhost:3001/organizations', {
      method: 'GET',
      credentials: 'include'
    });

    if (response.status === 401) {
      router.push('/login');
    } else {
      const data = await response.json();
      orgData.value = data;
      orgNames.value = data.map(org => org.organizationName);
      console.log(store.getters.user);
      const orgId = store.getters.user.defaultOrgId;
      console.log(orgId);
      defaultOrg.value = data.find(org => org.id === orgId).organizationName;
      orgDataLoaded.value = true;
    }
  }

  async function getOrganizationSummary() {
    fetch('http://localhost:3001/organizations/summary', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    }).then(response => {
      if (response.status === 401) {
        router.push('/login');
      } else {
        return response.json();
      }
    }).then(data => {
      testData.value = data;
      testDataLoaded.value = true;
    }).catch(error => {
      console.error('Error:', error);
    });
  }

  async function getOrganizationRepoData() {
    const response = await fetch('http://localhost:3001/repos', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
    
    if (response.status === 401) {
      router.push('/login');
    } else {
      const data = await response.json();
      repoData.value = data;
      repoDataLoaded.value = true;
    }
  }
</script>
