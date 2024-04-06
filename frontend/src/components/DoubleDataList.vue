<template>
  <v-row>
    <v-col cols="7">
      <v-data-table
        class="my-10 data-table"
        :headers="testHeaders"
        :items="props.testData"
        :items-per-page="10"
        :hide-default-footer="true"
      >
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Test Reports</v-toolbar-title>
          </v-toolbar>
        </template>
        <template v-slot:item="{ item }">
          <tr @click="navigateToSub(item.id, 'Tests')" class="cursor-pointer data-table-row">
            <td class="text-left">{{ item.date }}</td>
            <td>
              <v-chip class="passed" dark>{{ item.totalPassed }}</v-chip>
            </td>
            <td>
              <v-chip class="failed" dark>{{ item.totalFailures }}</v-chip>
            </td>
            <td>
              <v-chip class="error" dark>{{ item.totalErrors }}</v-chip>
            </td>
            <td>
              <v-chip class="skipped" dark>{{ item.totalSkipped }}</v-chip>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-col>
    <v-col cols="5">
      <v-data-table
        class="my-10 data-table"
        id="coverage-table"
        :headers="coverageHeaders"
        :items="props.coverageData"
        :items-per-page="10"
        :hide-default-footer="true"
      >
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Coverage Reports</v-toolbar-title>
          </v-toolbar>
        </template>
        <template v-slot:item="{ item }">
          <tr @click="navigateToSub(item.id, 'Coverage' )" class="cursor-pointer data-table-row">
            <td class="text-left">{{ item.date }}</td>
            <td>
              <v-chip dark>{{ item.lineRate }}</v-chip>
            </td>
            <td>
              <v-chip dark>{{ item.branchRate }}</v-chip>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-col>
    </v-row>
</template>

<script setup>
  import { ref, defineProps } from 'vue';
  import { useRouter } from 'vue-router';

  const router = useRouter();

  const props = defineProps({
    testData: {
      type: Object,
      required: true
    },
    coverageData: {
      type: Object,
      required: true
    },
  });

  const testHeaders = ref([
    { title: 'Date', value: 'date' },
    { title: 'Passed', value: 'totalPassed', align: 'center' },
    { title: 'Failed', value: 'totalFailures', align: 'center' },
    { title: 'Error', value: 'totalErrors', align: 'center' },
    { title: 'Skipped', value: 'totalSkipped', align: 'center' },
  ]);

  const coverageHeaders = ref([
    { title: 'Date', value: 'date' },
    { title: 'Line Rate', value: 'lineRate', align: 'center' },
    { title: 'Branch Rate', value: 'branchRate', align: 'center' },
  ]);

  async function navigateToSub(id, dataType) {
    await router.push({ name: dataType, params: { id } });
  }
  
</script>

<style scoped>
  .data-table th {
    text-align: center;
  }

  .data-table-row:hover {
    background-color: #f5f5f5;
  }

  .data-table-row td {
    text-align: center;
  }

  ::v-deep .v-data-table-footer__items-per-page {
    display: none;
  }
</style>