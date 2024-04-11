<template>
    <v-card-title class="bg-secondary">
      <v-row>
        <v-col cols="7">
          Test Summary
        </v-col>
        <v-col cols="5">
          Coverage Summary
        </v-col>
      </v-row>
    </v-card-title>
    <v-row class="py-1">
      <v-col cols="7">
        <div class="mx-4 my-4" style="height: 300px;">
          <canvas id="test-summary" v-if="testDataExists"></canvas>
          <v-alert v-else>No test data available.</v-alert>
        </div>
      </v-col>
      <v-col cols="5">
        <div class="mx-4 my-4" style="height: 300px;">
          <canvas id="coverage-summary" v-if="coverageDataExists"></canvas>
          <v-alert v-else>No coverage data available.</v-alert>
        </div>
      </v-col>
    </v-row>
</template>

<script setup>
  import { onMounted, defineProps, nextTick, ref } from 'vue';
  import { Chart, LineController, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Legend, Tooltip } from 'chart.js';

  const props = defineProps({
    testData: {
      type: Object,
      required: true
    },
    summaryType: {
      type: String,
      required: true
    }
  });

  const testDataExists = ref(false);
  const coverageDataExists = ref(false);

  Chart.register(LineController, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Legend, Tooltip);

  onMounted(() => {
    if (props.testData.tests) {
      testDataExists.value = true;
      generateTestChart();
    }
    if (props.testData.coverage) {
      coverageDataExists.value = true;
      generateCoverageChart();
    }
  });

  async function generateTestChart() {
    await nextTick();
    const tests = props.testData.tests.filter(test => test.totalPassed !== null);
    const passedTests = tests.map(test => test.totalPassed);
    const failedTests = tests.map(test => test.totalFailures);
    const errors = tests.map(test => test.totalErrors);
    const skipped = tests.map(test => test.totalSkipped);
    const labels = tests.map(test => formatDate(test.date));
    
    const ctx = document.getElementById('test-summary').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Passed',
            data: passedTests,
            backgroundColor: 'green',
            borderColor: 'green',
          },
          {
            label: 'Failed',
            data: failedTests,
            backgroundColor: 'orange',
            borderColor: 'orange',
          },
          {
            label: 'Errors',
            data: errors,
            backgroundColor: 'red',
            borderColor: 'red',
          },
          {
            label: 'Skipped',
            data: skipped,
            backgroundColor: '#FFD700',
            borderColor: '#FFD700',
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          }
        }
      },
    });
  }

  async function generateCoverageChart() {
    await nextTick();
    const coverage = props.testData.coverage.filter(test => test.lineRate !== null);
    const lineRate = coverage.map(cov => cov.lineRate);
    const branchRate = coverage.map(cov => cov.branchRate);
    const labels = coverage.map(cov => formatDate(cov.date));

    const ctx = document.getElementById('coverage-summary').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Line Rate',
            data: lineRate,
            backgroundColor: 'blue',
            borderColor: 'blue',
          },
          {
            label: 'Branch Rate',
            data: branchRate,
            backgroundColor: 'red',
            borderColor: 'red',
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          }
        }
      },
    });
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate() + 1;
    return `${month}-${day}`;
  } 
</script>
