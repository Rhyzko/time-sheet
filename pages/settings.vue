<script setup lang="ts">
const { fetchClients, addClient, deleteClient, clientList } = useTimeSheetDatabase()

const client = ref('')

onMounted(async () => {
  await fetchClients()
})

const goToAmpTicketList = (client: string) => {
  window.open(`https://amp.service-now.com/task_list.do?sysparm_nostack=true&sysparm_first_row=1&sysparm_query=sys_class_name%3Dincident^ORsys_class_name%3Dsc_req_item^assignment_group%3D1221c06fc36a55107bdb75d4e40131fd^GOTOcompany.nameLIKE${client}^closed_atISEMPTY^ORDERBYDESCsys_updated_on&sysparm_view=`, '_blank')
}

const selectColor = (color: string) => {
  console.log(color)
}
</script>
<template>
  <section class=" flex flex-wrap gap-3" v-auto-animate>
    <UCard v-for="client in clientList" :key="client.id" class="w-56">
      <template #header>
        <div class="flex flex-row items-center">
          <span>{{ client.label }}</span>
          <Color-Picker class="ml-auto" @selected="(color) => selectColor(color)"></Color-Picker>
          <UButton icon="i-heroicons-trash" class="ml-2" @click=" deleteClient(client.id)"></UButton>
        </div>
      </template>
      <UButton icon="i-material-symbols-view-list-outline" @click="goToAmpTicketList(client.label)"></UButton>
      Tags
    </UCard>
    <UCard class="w-56">
      <template #header>
        <div class="flex flex-row items-center gap-1">
          <UInput v-model="client"></UInput>
          <UButton icon="i-heroicons-plus" class="ml-auto" @click="addClient(client)"></UButton>
        </div>
      </template>
    </UCard>
  </section>
</template>
