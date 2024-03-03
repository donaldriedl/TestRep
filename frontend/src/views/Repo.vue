<template>
  <v-container class="fill-height">
    <v-responsive class="d-flex align-top text-center fill-height">
      <template v-if="testDataLoaded && branchDataLoaded">
        <Dashboard :test-data="testData" summary-type="Repository" />
        <DataList :repo-data="branchData" data-type="Branches" />
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
  const repoId = router.currentRoute.value.params.id;
  const testData = ref({});
  const branchData = ref({});
  const testDataLoaded = ref(false);
  const branchDataLoaded = ref(false);

  onMounted(() => {
    getRepoSummary();
    getRepoBranchData();
  });

  async function getRepoSummary() {
    const response = await fetch(`http://localhost:3001/repos/${repoId}/summary`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })
    
    if (response.status === 401) {
      router.push('/login');
    } else {
      const data = await response.json();
      testData.value = data;
      testDataLoaded.value = true;
    }
  }

  async function getRepoBranchData() {
    const response = await fetch(`http://localhost:3001/repos/${repoId}/branches`, {
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
      branchData.value = data;
      branchDataLoaded.value = true;
    }
  }

</script>