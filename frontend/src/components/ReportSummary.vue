<template>
    <v-card class="my-8" elevation="4">
      <v-row>
        <v-col cols="12">
            <v-card-title class="bg-secondary"> Test Reports {{ props.reportData.date }} </v-card-title>
            <v-divider></v-divider>
            <v-row>
              <v-col>
                <div class="mx-auto my-4" style="height: 300px; display: flex; justify-content: center;"><canvas id="report-summary"></canvas></div>
              </v-col>
              <v-divider vertical inset></v-divider>
              <v-col>
                <v-row class="my-1 align-center">
                  <v-col>
                    <h4>Total Passed</h4>
                  </v-col>
                  <v-col>
                    <v-chip class="passed">{{ props.reportData.totalPassed }}</v-chip>
                  </v-col>
                </v-row>
                <v-divider></v-divider>
                <v-row class="my-1 align-center">
                  <v-col>
                    <h4>Total Failures</h4>
                  </v-col>
                  <v-col>
                    <v-chip class="failed">{{ props.reportData.totalFailures }}</v-chip>
                  </v-col>
                </v-row>
                <v-divider></v-divider>
                <v-row class="my-1 align-center">
                  <v-col>
                    <h4>Total Errors</h4>
                  </v-col>
                  <v-col>
                    <v-chip class="error">{{ props.reportData.totalErrors }}</v-chip>
                  </v-col>
                </v-row>
                <v-divider></v-divider>
                <v-row class="my-1 align-center">
                  <v-col>
                    <h4>Total Skipped</h4>
                  </v-col>
                  <v-col>
                    <v-chip class="skipped">{{ props.reportData.totalSkipped ?? 0 }}</v-chip>
                  </v-col>
                </v-row>
                <v-divider></v-divider>
                <v-row class="my-1 align-center">
                  <v-col>
                    <h4>Duration</h4>
                  </v-col>
                  <v-col>
                    <v-chip>{{ props.reportData.duration }} seconds</v-chip>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
        </v-col>
      </v-row>
      <v-divider></v-divider>
      <v-row>
        <v-col cols="12">
          <v-expansion-panels variant="accordion" elevation="0">
            <v-expansion-panel v-for="(suite, index) in props.suiteData" :key="index" elevation="0">
              <v-expansion-panel-title>
                <v-row>
                  <v-col cols="3" class="d-flex align-center">{{ suite.suiteName }}</v-col>
                  <v-col cols="2"><v-chip class="passed">{{ suite.totalPassed }}</v-chip></v-col>
                  <v-col cols="2"><v-chip class="failed">{{ suite.totalFailures }}</v-chip></v-col>
                  <v-col cols="2"><v-chip class="error">{{ suite.totalErrors }}</v-chip></v-col>
                  <v-col cols="2"><v-chip class="skipped">{{ suite.totalSkipped }}</v-chip></v-col>
                </v-row>
              </v-expansion-panel-title flat>
              <v-expansion-panel-text>
                <v-expansion-panels variant="accordion" elevation="0">
                  <v-expansion-panel v-for="(test, index) in suite.TestCases" :key="index" elevation="0">
                    <v-expansion-panel-title :disabled="test.result !== 'failure' && test.result !== 'error'">
                      <v-row class="align-center">
                        <v-col cols="8">{{ test.caseName }}</v-col>
                        <v-col cols="3">
                          <v-chip>{{ test.duration }} seconds</v-chip>
                        </v-col>
                        <v-col cols="1">
                          <v-icon v-if="test.result === 'success'" color="green">mdi-check-circle</v-icon>
                          <v-icon v-else-if="test.result === 'failure'" style="color: darkorange;">mdi-alert-circle</v-icon>
                          <v-icon v-else-if="test.result === 'error'" color="red">mdi-alert-octagon</v-icon>
                          <v-icon v-else-if="test.result === 'skipped'" style="color: gold;">mdi-alert-remove</v-icon>
                        </v-col>
                      </v-row>
                    </v-expansion-panel-title>
                    <v-expansion-panel-text>
                      <v-row v-if="test.result === 'failure' || test.result === 'error'">
                        <v-col class="text-left" style="overflow: auto;">
                          <pre><code> {{ test.stackTrace }} </code></pre>
                        </v-col>
                      </v-row>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-col>
      </v-row>
    </v-card>
</template>

<script setup>
  import { onMounted, defineProps, ref } from 'vue';
  import { Chart, ArcElement, DoughnutController, Legend, Tooltip } from 'chart.js';

  Chart.register(ArcElement, DoughnutController, Legend, Tooltip);

  const props = defineProps({
    reportData: {
      type: Object,
      required: true
    },
    suiteData: {
      type: Array,
      required: true
    }
  });

  onMounted(() => {
    generateReportChart();
    console.log(props.suiteData);
    props.suiteData.forEach(suite => {
      suite.totalPassed = suite.totalTests - (suite.totalFailures + suite.totalErrors + suite.totalSkipped);
    })
  });

  async function generateReportChart() {
    const ctx = document.getElementById('report-summary').getContext('2d');
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Passed', 'Failed', 'Errors', 'Skipped'],
        datasets: [{
          label: 'Test Summary',
          data: [props.reportData.totalPassed, props.reportData.totalFailures, props.reportData.totalErrors, props.reportData.totalSkipped],
          backgroundColor: ['green', 'darkorange', 'red', 'gold'],
        }]
      },
      options: {
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }
</script>
