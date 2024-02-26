<template>
  <v-data-table
    class="my-10"
    :headers="headers"
    :items="props.repoData"
    :items-per-page="5"
    :hide-default-footer="true"
  >
    <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>Repositories</v-toolbar-title>
      </v-toolbar>
    </template>
    <template v-slot:item.name="{ item }" class="text-left">
      <h5> {{ item.name }} </h5>
    </template>
    <template v-slot:item.totalPassed="{ item }" class="text-left">
      <v-chip color="success" dark>{{ item.totalPassed }}</v-chip>
    </template>
    <template v-slot:item.totalFailures="{ item }" class="center">
      <v-chip color="error" dark>{{ item.totalFailures }}</v-chip>
    </template>
    <template v-slot:item.totalErrors="{ item }">
      <v-chip color="error" dark>{{ item.totalErrors }}</v-chip>
    </template>
    <template v-slot:item.totalSkipped="{ item }">
      <v-chip color="warning" dark>{{ item.totalSkipped }}</v-chip>
    </template>
    <template v-slot:item.lineRate="{ item }">
      <v-chip color="primary" dark>{{ item.lineRate }}</v-chip>
    </template>
    <template v-slot:item.branchRate="{ item }">
      <v-chip color="primary" dark>{{ item.branchRate }}</v-chip>
    </template>
  </v-data-table>
</template>

<script setup>
  import { ref, onMounted, defineProps } from 'vue';

  const props = defineProps({
    repoData: {
      type: Object,
      required: true
    },
  });

  const headers = ref([
    { title: 'Name', value: 'name' },
    { title: 'Passed Tests', value: 'totalPassed' },
    { title: 'Failed Tests', value: 'totalFailures' },
    { title: 'Error Tests', value: 'totalErrors' },
    { title: 'Skipped Tests', value: 'totalSkipped' },
    { title: 'Line Rate', value: 'lineRate' },
    { title: 'Branch Rate', value: 'branchRate' },
  ]);

  onMounted(() => {
    console.log(props.repoData);
  });
  
</script>