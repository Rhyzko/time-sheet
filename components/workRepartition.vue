<script setup lang="ts">
const props = defineProps({
    categories: {
        type: Array<Client>,
        required: true
    },
    rows: {
        type: Array<TimeRow>,
        required: true
    },
    title: {
        type: String,
        required: false,
        default: 'Work repartition'
    }
})

const workRepartitionDataset = computed(() => {
    return props.categories.map((client: any) => {
        const workHours = props.rows.filter((row) => row.client === client.label).reduce((acc, row) => acc + Number(row.timeSpent), 0);
        return {
            label: client.label,
            color: client.color,
            value: workHours
        }
    })
})

const totalTime = computed(() => {
    return props.rows.reduce((acc, row) => {
        if (isNaN(Number(row.timeSpent))) {
            return acc
        }
        return acc + Number(row.timeSpent)
    }, 0);
})

</script>

<template>
    <UCard class="flex flex-col flex-1"
        :ui="{ body: { base: 'flex-1' }, ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
            <div class="text-center text-2xl">{{ title }}</div>
        </template>
        <DonutChart :dataset="workRepartitionDataset" />
        <div class="text-center justify-center align-middle mt-2">{{ totalTime.toFixed(1) }}</div>
    </UCard>
</template>