<template>
  <v-container class="fill-height">
    <v-responsive class="d-flex align-top text-center fill-height">
      <template v-if="reportDataLoaded">
        <CoverageSummary :coverage-data="coverageData" />
      </template>
    </v-responsive>
  </v-container>   
</template>
  
<script setup>
    import CoverageSummary from '@/components/CoverageSummary.vue';
    import Helpers from '@/helpers.js';
    import { onMounted, ref } from 'vue';
    import { useRouter } from 'vue-router';
    import { useStore } from 'vuex';

    const router = useRouter();
    const store = useStore();

    const reportId = router.currentRoute.value.params.id;
    const coverageData = ref({});
    const reportDataLoaded = ref(false);

    onMounted(() => {
      getCoverageData();
    });

    async function getCoverageData() {
    const response = await fetch(`http://localhost:3001/coverage/${reportId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })
    
    if (Helpers.validateResponse(response)) {
      const data = await response.json();
      console.log(data);
      coverageData.value = {
        date: Helpers.formatDate(data.coverageDetails.resultTime),
        lineRate: data.coverageDetails.lineRate,
        branchRate: data.coverageDetails.branchRate,
        coveredLines: data.coverageDetails.totalLines,
        totalLines: data.coverageDetails.validLines,
        coverageFiles: data.coverageDetails.CoverageFiles
      }
      reportDataLoaded.value = true;
    } else {
      store.commit('showError', 'Error retrieving coverage data');
    }
  }
</script>