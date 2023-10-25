<script setup lang="ts">
const { fetchClients, addClient, deleteClient, clientList } = useTimeSheetDatabase()

const client = ref('')

onMounted(async () => {
  await fetchClients()
})
</script>
<template>
  <section class=" flex flex-wrap gap-3" v-auto-animate>
    <UCard v-for="client in clientList" :key="client.id" class="w-56">
      <template #header>
        <div class="flex flex-row items-center">
          <span>{{ client.label }}</span>
          <UButton icon="i-heroicons-trash" class="ml-auto" @click="deleteClient(client.id)"></UButton>
        </div>
      </template>
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
