<template>
  <v-container class="fill-height">
    <v-responsive class="d-flex align-top text-center fill-height">
      <template v-if="reportDataLoaded">
        <ReportSummary :report-data="reportData" :suite-data="reportSuites" />
      </template>
    </v-responsive>
  </v-container>   
</template>
  
<script setup>
    import ReportSummary from '@/components/ReportSummary.vue';
    import { onMounted, ref } from 'vue';
    import { useRouter } from 'vue-router';
    import { useStore } from 'vuex';
    import Helpers from '@/helpers.js';

    const router = useRouter();
    const store = useStore();

    const reportId = router.currentRoute.value.params.id;
    const reportData = ref({});
    const reportSuites = ref([]);
    const reportDataLoaded = ref(false);

    onMounted(() => {
      getReportData();
    });

    async function getReportData() {
    const response = await fetch(`http://localhost:3001/tests/${reportId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    })
    
    if(Helpers.validateResponse(response)) {
      const data = await response.json();
      reportData.value = {
        date: Helpers.formatDate(data.date),
        duration: data.duration,
        totalPassed: data.totalPassed,
        totalFailures: data.totalFailures,
        totalSkipped: data.totalSkipped,
        totalErrors: data.totalErrors,
      }
      reportSuites.value = data.TestSuites;
      reportDataLoaded.value = true;
    } else {
      store.commit('showError', 'Error retrieving report data');
    }
  }
</script>