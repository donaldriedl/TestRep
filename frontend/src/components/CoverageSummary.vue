<template>
    <v-row>
      <v-col cols="12">
        <v-card elevation="4" class="m-4">
          <v-card-title class="bg-secondary"> {{ props.coverageData.date }} </v-card-title>
          <v-divider></v-divider>
          <v-row>
            <v-col>
              <div class="mx-auto my-4" style="height: 300px; display: flex; justify-content: center;"><canvas id="report-summary"></canvas></div>
            </v-col>
            <v-divider vertical inset></v-divider>
            <v-col>
              <v-divider></v-divider>
              <v-row class="my-1 align-center">
                <v-col>
                  <h4>Line Rate</h4>
                </v-col>
                <v-col>
                  <v-chip>{{ `${props.coverageData.lineRate * 100}%` }}</v-chip>
                </v-col>
              </v-row>
              <v-divider></v-divider>
              <v-row class="my-1 align-center">
                <v-col>
                  <h4>Branch Rate</h4>
                </v-col>
                <v-col>
                  <v-chip>{{ `${props.coverageData.branchRate * 100}%` }}</v-chip>
                </v-col>
              </v-row>
              <v-divider></v-divider>
              <v-row class="my-1 align-center">
                <v-col>
                  <h4>Total Lines</h4>
                </v-col>
                <v-col>
                  <v-chip>{{ props.coverageData.totalLines }}</v-chip>
                </v-col>
              </v-row>
              <v-divider></v-divider>
              <v-row class="my-1 align-center">
                <v-col>
                  <h4>Covered Lines</h4>
                </v-col>
                <v-col>
                  <v-chip>{{ props.coverageData.coveredLines }}</v-chip>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-data-table
                :headers="listHeader"
                :items="props.coverageData.coverageFiles"
                item-key="fileName"
                class="elevation-1">
                <template v-slot:item = "{ item }">
                  <tr class="data-table-row">
                    <td class="text-left">{{  item.fileName }}</td>
                    <td>
                      <v-chip dark>{{ `${(item.lineRate * 100).toFixed(2)}%` }}</v-chip>
                    </td>
                    <td>
                      <v-chip dark>{{ `${(item.branchRate * 100).toFixed(2)}%` }}</v-chip>
                    </td>
                  </tr>
                </template>
              </v-data-table>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
</template>

<script setup>
  import { onMounted, defineProps, ref } from 'vue';
  import { Chart, Colors, BarController, BarElement, CategoryScale, LinearScale, Legend} from 'chart.js';

  Chart.register(Colors, BarController, BarElement, CategoryScale, LinearScale, Legend);

  const props = defineProps({
    coverageData: {
      type: Object,
      required: true
    },
  });

  const listHeader = ref([
    { title: 'File Name', value: 'fileName' },
    { title: 'Line Rate', value: 'lineRate', align: 'center' },
    { title: 'Branch Rate', value: 'branchRate', align: 'center' }
  ]);

  onMounted(() => {
    generateReportChart();
  });

  async function generateReportChart() {
    const ctx = document.getElementById('report-summary').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Line Rate', 'Branch Rate'],
        datasets: [{
          data: [props.coverageData.lineRate, props.coverageData.branchRate],
          backgroundColor: ['rgba(255, 0, 0, 0.5)', 'rgba(0, 0, 255, 0.5)'],
          borderColor: ['rgba(255, 0, 0, 1)', 'rgba(0, 0, 255, 1)'],
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 0.1,
              callback: function(value) {
                return value * 100 + "%";
              }
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }
</script>
