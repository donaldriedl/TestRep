<template>
  <v-data-table
    class="data-table"
    :headers="headers"
    :items="props.repoData"
    :items-per-page="5"
    :hide-default-footer="true"
  >
    <template v-slot:item = "{ item }">
      <tr @click="navigateToSub(item.id, )" class="cursor-pointer data-table-row">
        <td class="text-left">{{  item.name }}</td>
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
        <td>
          <v-chip dark>{{ item.lineRate }}</v-chip>
        </td>
        <td>
          <v-chip dark>{{ item.branchRate }}</v-chip>
        </td>
      </tr>
    </template>
    <template v-slot:no-data>
      <p> No Data Available </p>
    </template>
  </v-data-table>
</template>

<script setup>
  import { ref, defineProps } from 'vue';
  import { useRouter } from 'vue-router';

  const router = useRouter();

  const props = defineProps({
    repoData: {
      type: Object,
      required: true
    },
    dataType: {
      type: String,
      required: true
    }
  });
  

  const headers = ref([
    { title: 'Name', value: 'name' },
    { title: 'Passed Tests', value: 'totalPassed', align: 'center' },
    { title: 'Failed Tests', value: 'totalFailures', align: 'center' },
    { title: 'Error Tests', value: 'totalErrors', align: 'center' },
    { title: 'Skipped Tests', value: 'totalSkipped', align: 'center' },
    { title: 'Line Rate', value: 'lineRate', align: 'center' },
    { title: 'Branch Rate', value: 'branchRate', align: 'center' },
  ]);

  async function navigateToSub(id) {
    await router.push({ name: props.dataType, params: { id } });
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
</style>