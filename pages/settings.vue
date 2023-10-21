<script setup lang="ts">
import type { Database } from '~/types/supabase';

const supabase = useSupabaseClient<Database>()

const projects = ref<Project[]>([])
const clients = ref<Client[]>([])

const selectedClient = ref<Client | undefined>(undefined)

const project = ref('')
const client = ref('')

const fetchProjects = async () => {
  const { data, error } = await supabase.from('projects').select('*')
  if (error) {
    console.error(error)
  } else {
    projects.value = data ?? []
  }
}

const fetchClients = async () => {
  const { data, error } = await supabase.from('clients').select('*')
  if (error) {
    console.error(error)
  } else {
    clients.value = data ?? []
  }
}

onMounted(async () => {
  await Promise.all([fetchProjects(), fetchClients()])
})

const addProject = async () => {
  if (!selectedClient.value) return console.error('No client selected');
  const { data, error } = await supabase.from('projects').insert([{ label: project.value, clientId: selectedClient.value.id }]).select('*')
  if (error) {
    console.error(error)
  } else {
    projects.value = projects.value.concat(data ?? [])
  }
}

const addClient = async () => {
  const { data, error } = await supabase.from('clients').insert([{ label: client.value }]).select('id, label')
  if (error) {
    console.error(error)
  } else {
    clients.value = clients.value.concat(data ?? [])
  }
}

const deleteClient = async (id: number) => {
  const { data, error } = await supabase.from('clients').delete().match({ id })
  if (error) {
    console.error(error)
  } else {
    clients.value = clients.value.filter((client) => client.id !== id)
  }
}

const deleteProject = async (id: number) => {
  const { data, error } = await supabase.from('projects').delete().match({ id })
  if (error) {
    console.error(error)
  } else {
    projects.value = projects.value.filter((project) => project.id !== id)
  }
}
</script>

<template>
  <div>
    <UInput v-model="client"></UInput>
    <UButton>
      <Icon name="i-heroicons-plus" @click="addClient"></Icon>
    </UButton>
    <div v-for="client in clients" :key="client.id">
      <UBadge :label="client.label">
      </UBadge>
      <Icon name="i-heroicons-trash" @click="deleteClient(client.id)"></Icon>
    </div>

    <UInput v-model="project"></UInput>
    <USelectMenu v-model="selectedClient" :options="clients" />
    <UButton>
      <Icon name="i-heroicons-plus" @click="addProject"></Icon>
    </UButton>
    <div v-for="project in projects" :key="project.id">
      <UBadge :label="project.label">
      </UBadge>
      <Icon name="i-heroicons-trash" @click="deleteProject(project.id)"></Icon>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
