<script setup lang="ts">
const { fetchClients, addClient, deleteClient, updateClientColor, clientList } = useTimeSheetDatabase()
const { getColorLabelFromCode } = useColor()
const { goToClientAmpTicketList } = useAmp()

const client = ref('')

onMounted(async () => {
  await fetchClients()
})

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
      <section class="flex flex-row mb-2">
        <UTooltip text="Go to AMP tickets">
          <UButton icon="i-material-symbols-view-list-outline" @click="goToClientAmpTicketList(client.label)"></UButton>
        </UTooltip>
        <Color-Picker class="ml-auto" @selected="(color) => selectColor(color.code, client.id)"></Color-Picker>
        <UButton icon="i-heroicons-trash" class="ml-2" @click=" deleteClient(client.id)"></UButton>
      </section>
      <UTooltip :text="client.chargeable ? 'Chargeable' : 'Not chargeable'">
        <UToggle on-icon="i-heroicons-check-20-solid" off-icon="i-heroicons-x-mark-20-solid" v-model="client.chargeable"
          disabled class="disabled:cursor-auto" />
      </UTooltip>
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
