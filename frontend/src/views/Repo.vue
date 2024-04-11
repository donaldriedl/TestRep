<template>
  <v-container class="fill-height">
    <v-responsive class="d-flex align-top text-center fill-height">
      <template v-if="testDataLoaded && branchDataLoaded">
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
          <v-dialog v-model="showSettings" max-width="300">
            <v-card>
              <v-card-title>Repo Settings</v-card-title>
              <v-select
                v-model="defaultBranch"
                :items="branchNames"
                label="Primary Branch"
                class="mx-4"
              />
              <v-card-actions>
                <v-btn text @click="saveSettings">Save</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <Dashboard :test-data="testData" summary-type="Repository" />
          <DataList :repo-data="branchData" data-type="Branches" />
        </v-card>
      </template>
    </v-responsive>
  </v-container>
</template>

<script setup>
  import Dashboard from '@/components/Dashboard.vue'
  import DataList from '@/components/DataList.vue'
  import Helpers from '@/helpers.js';
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';

  const router = useRouter();
  const repoId = router.currentRoute.value.params.id;
  const testData = ref({});
  const branchData = ref({});
  const branchNames = ref([]);
  const defaultBranch = ref('');
  const testDataLoaded = ref(false);
  const branchDataLoaded = ref(false);
  const showSettings = ref(false);

  onMounted(() => {
    getRepoSummary();
    getRepoBranchData();
  });

  async function getRepoSummary() {
    const response = await fetch(`http://localhost:3001/repos/${repoId}/summary`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    })

    if (Helpers.validateResponse(response)) {
      const data = await response.json();
      testData.value = data;
      testDataLoaded.value = true;
    } else {
      store.commit('showError', 'Error retrieving repository summary data');
    }
  }

  async function getRepoBranchData() {
    const response = await fetch(`http://localhost:3001/repos/${repoId}/branches`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    
    if(Helpers.validateResponse(response)) {
      const data = await response.json();
      branchData.value = data;
      branchNames.value = data.map(branch => branch.name);
      defaultBranch.value = data.find(branch => branch.isPrimary).name;
      branchDataLoaded.value = true;
    } else {
      store.commit('showError', 'Error retrieving branch data');
    }
  }

  async function saveSettings() {
    const primaryBranch = branchData.value.find(branch => branch.name === defaultBranch.value);
    const response = await fetch(`http://localhost:3001/repos/${repoId}/branches`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ primaryBranch: primaryBranch.id }),
      credentials: 'include'
    });

    if (Helpers.validateResponse(response)) {
      showSettings.value = false;
    } else {
      store.commit('showError', 'Error saving repository settings');
    }
  }

</script>