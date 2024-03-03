<template>
  <v-container class="fill-height">
    <v-responsive class="d-flex align-top text-center fill-height">
      <template v-if="summaryDataLoaded && branchTestDataLoaded && branchCoverageDataLoaded">
        <Dashboard :test-data="testData" summary-type="Branch" />
        <v-container>
          <v-row>
            <v-col>
              <DataList :repo-data="testData" data-type="Tests" />
            </v-col>
            <v-col>
              <DataList :repo-data="coverageData" data-type="Coverage" />
            </v-col>
          </v-row>
        </v-container>
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
  const branchId = router.currentRoute.value.params.id;
  const summaryData = ref({});
  const testData = ref({});
  const coverageData = ref({});
  const summaryDataLoaded = ref(false);
  const branchTestDataLoaded = ref(false);
  const branchCoverageDataLoaded = ref(false);

  onMounted(() => {
    getBranchSummary();
    getBranchTestData();
    getBranchCoverageData();
  });

  async function getBranchSummary() {
    const response = await fetch(`http://localhost:3001/branches/${branchId}/summary`, {
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
      summaryData.value = data;
      summaryDataLoaded.value = true;
    }
  }

  async function getBranchTestData() {
    const response = await fetch(`http://localhost:3001/branches/${branchId}/tests`, {
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
      testData.value = data;
      branchTestDataLoaded.value = true;
      console.log(data);
    }
  }

  async function getBranchCoverageData() {
    const response = await fetch(`http://localhost:3001/branches/${branchId}/coverage`, {
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
      coverageData.value = data;
      branchCoverageDataLoaded.value = true;
      console.log(data);
    }
  }

</script>