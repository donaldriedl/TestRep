<template>
  <v-container class="fill-height">
    <v-responsive class="d-flex align-top text-center fill-height">
      <template v-if="summaryDataLoaded && branchTestDataLoaded && branchCoverageDataLoaded">
        <v-card class="my-8" elevation="4">
          <Dashboard :test-data="summaryData" summary-type="Branch" />
          <v-container>
            <DoubleDataList :test-data="testData" :coverage-data="coverageData" />
          </v-container>
        </v-card>
      </template>
    </v-responsive>
  </v-container>
</template>

<script setup>
  import Dashboard from '@/components/Dashboard.vue'
  import DoubleDataList from '@/components/DoubleDataList.vue';
  import Helpers from '@/helpers.js';
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useStore } from 'vuex';

  const router = useRouter();
  const store = useStore();

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
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    })
    
    if (Helpers.validateResponse(response)) {
      const data = await response.json();
      summaryData.value = data;
      summaryDataLoaded.value = true;
    } else {
      store.commit('showError', 'Error retrieving branch summary data');
    }
  }

  async function getBranchTestData() {
    const response = await fetch(`http://localhost:3001/branches/${branchId}/tests`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    
    if (Helpers.validateResponse(response)) {
      const data = await response.json();
      data.forEach((test) => {
        test.date = Helpers.formatDate(test.date);
      });
      testData.value = data;
      branchTestDataLoaded.value = true;
    } else {
      store.commit('showError', 'Error retrieving branch test data');
    }
  }

  async function getBranchCoverageData() {
    const response = await fetch(`http://localhost:3001/branches/${branchId}/coverage`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    
    if (Helpers.validateResponse(response)) {
      const data = await response.json();
      data.forEach((coverage) => {
        coverage.date = Helpers.formatDate(coverage.date);
        coverage.lineRate = `${(coverage.lineRate * 100).toFixed(2)}%`;
        coverage.branchRate = `${(coverage.branchRate * 100).toFixed(2)}%`;
      });
      coverageData.value = data;
      branchCoverageDataLoaded.value = true;
    } else if (response.status === 404) {
      branchCoverageDataLoaded.value = true;
      coverageData.value = [];
    } else {
      store.commit('showError', 'Error retrieving branch coverage data');
    }
  }
</script>