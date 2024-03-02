<template>
  <v-container class="fill-height">
    <v-responsive class="d-flex align-top text-center fill-height">
      <template v-if="testDataLoaded && repoDataLoaded">
        <Dashboard :test-data="testData" summary-type="Organization" />
        <DataList :repo-data="repoData" />
      </template>
    </v-responsive>
  </v-container>
</template>

<script setup>
  import Dashboard from '@/components/Dashboard.vue'
  import DataList from '@/components/DataList.vue'
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';

  const router = useRouter();
  const testData = ref({});
  const repoData = ref({});
  const testDataLoaded = ref(false);
  const repoDataLoaded = ref(false);

  onMounted(() => {
    getOrganizationSummary();
    getOrganizationRepoData();
  });

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
    const response = fetch('http://localhost:3001/repos', {
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
