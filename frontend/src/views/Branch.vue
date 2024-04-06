<template>
  <v-container class="fill-height">
    <v-responsive class="d-flex align-top text-center fill-height">
      <template v-if="summaryDataLoaded && branchTestDataLoaded && branchCoverageDataLoaded">
        <Dashboard :test-data="summaryData" summary-type="Branch" />
        <v-container>
          <DoubleDataList :test-data="testData" :coverage-data="coverageData" />
        </v-container>
      </template>
    </v-responsive>
  </v-container>
</template>

<script setup>
  import Dashboard from '@/components/Dashboard.vue'
  import DoubleDataList from '@/components/DoubleDataList.vue';
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
      data.forEach((test) => {
        test.date = formatDate(test.date);
      });
      testData.value = data;
      branchTestDataLoaded.value = true;
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
    } else if (response.status === 404) {
      branchCoverageDataLoaded.value = true;
      coverageData.value = [];
    } else {
      const data = await response.json();
      data.forEach((coverage) => {
        coverage.date = formatDate(coverage.date);
        coverage.lineRate = `${(coverage.lineRate * 100).toFixed(2)}%`;
        coverage.branchRate = `${(coverage.branchRate * 100).toFixed(2)}%`;
      });
      coverageData.value = data;
      branchCoverageDataLoaded.value = true;
    }
  }

  function formatDate(date) {
    const formattedDate = new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
    return formattedDate;
  }

</script>