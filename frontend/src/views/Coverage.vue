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
    import { onMounted, ref } from 'vue';
    import { useRouter } from 'vue-router';
    import Helpers from '@/helpers.js';

    const router = useRouter();

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
    
    if (response.status === 401) {
      router.push('/login');
    } else {
      const data = await response.json();
      coverageData.value = {
        date: Helpers.formatDate(data.CoverageDetails.resultTime),
        lineRate: data.CoverageDetails.lineRate,
        branchRate: data.CoverageDetails.branchRate,
        coveredLines: data.CoverageDetails.totalLines,
        totalLines: data.CoverageDetails.validLines,
        coverageFiles: data.CoverageDetails.CoverageFiles
      }
      console.log(coverageData);
      reportDataLoaded.value = true;
    }
  }
</script>