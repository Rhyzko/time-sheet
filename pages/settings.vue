<script setup lang="ts">
const { fetchClients, addClient, deleteClient, updateClientColor, clientList } = useTimeSheetDatabase()
const { getColorLabelFromCode } = useColor()
const client = ref('')

onMounted(async () => {
  await fetchClients()
})

const goToAmpTicketList = (client: string) => {
  window.open(`https://amp.service-now.com/task_list.do?sysparm_nostack=true&sysparm_first_row=1&sysparm_query=sys_class_name%3Dincident^ORsys_class_name%3Dsc_req_item^assignment_group%3D1221c06fc36a55107bdb75d4e40131fd^GOTOcompany.nameLIKE${client}^closed_atISEMPTY^ORDERBYDESCsys_updated_on&sysparm_view=`, '_blank')
}

const selectColor = async (color: string, clientId: number) => {
  await updateClientColor(clientId, color)
}
</script>
<template>
  <section class=" flex flex-wrap gap-3 pt-4 mx-4" v-auto-animate>
    <UCard v-for="client in clientList" :key="client.id" class="w-56 h-52"
      :ui="{ header: { background: client.color ? `bg-${getColorLabelFromCode(client.color)}-500` : '' } }">
      <template #header>
        <span>{{ client.label }}</span>
      </template>
      <section class="flex flex-row">
        <UTooltip text="Go to AMP tickets">
          <UButton icon="i-material-symbols-view-list-outline" @click="goToAmpTicketList(client.label)"></UButton>
        </UTooltip>
        <Color-Picker class="ml-auto" @selected="(color) => selectColor(color.code, client.id)"></Color-Picker>
        <UButton icon="i-heroicons-trash" class="ml-2" @click=" deleteClient(client.id)"></UButton>
      </section>
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
