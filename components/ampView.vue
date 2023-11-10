<script setup lang="ts">
const timesheetStore = useTimesheetStore()
const { timeSheetRowsStyled, workByAmpArray } = storeToRefs(timesheetStore)
const { validateAmpInput } = timesheetStore

const { goToAmpTicket, goToAmpTicketList } = useAmp()

const totalAmp = computed(() => {
    return timeSheetRowsStyled.value.filter((row) => row.ampFilled).reduce((acc, row) => acc + Number(row.timeSpent), 0)
})

const totalTime = computed(() => {
    const total = timeSheetRowsStyled.value.filter((row) => row.type === 'work').reduce((acc, row) => acc + Number(row.timeSpent), 0);
    if (isNaN(total)) {
        return null;
    }
    return total;
})

const ampColumns = [
    {
        label: 'AMP',
        key: 'amp',
        sortable: true,
    },
    {
        label: 'Client',
        key: 'client',
        sortable: true,
    },
    {
        label: 'Total',
        key: 'total',
        sortable: true,
    },
    {
        label: 'Go to ticket',
        key: 'goToTicket'
    }
]

const ampTables = [
    {
        label: 'In a nutshell',
        icon: 'i-heroicons-information-circle',
        slot: 'nutshell'
    },
    {
        label: 'Tickets to fill in AMP',
        icon: 'i-material-symbols-drive-file-rename-outline-rounded',
        defaultOpen: true,
        slot: 'amp-not-filled'
    },
    {
        label: 'All tickets',
        icon: 'i-material-symbols-view-list-outline',
        slot: 'all'
    }
]
</script>

<template>
    <UCard class="flex flex-col"
        :ui="{ base: 'overflow-auto', ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
            <div class="text-center text-2xl">AMP View</div>
        </template>
        <UAccordion :items="ampTables" multiple class="mt-4">
            <template #nutshell>
                <UCard :ui="{ ring: 'ring-1 ring-primary dark:ring-primary m-2' }">
                    <section class="flex flex-row items-center place-content-between">
                        <div class="flex flex-col text-sm text-primary">
                            <p>Chargeable time {{ totalAmp.toFixed(1) }}</p>
                            <p>Chargeability
                                <span class="text-sm font-medium">{{ ((totalAmp ?? 0) / (totalTime ?? 1) *
                                    100).toFixed(1)
                                }}</span>
                                %
                            </p>
                            <p>Time without AMP ticket : {{ ((totalTime ?? 0) - totalAmp).toFixed(1) }}</p>
                        </div>
                        <div>
                            <UButton @click="goToAmpTicketList(workByAmpArray.map(row => row.amp))" class="ml-2"
                                icon="i-material-symbols-list-alt-outline-rounded" />
                        </div>
                    </section>
                </UCard>
            </template>
            <template #amp-not-filled>
                <UCard v-if="workByAmpArray.filter(row => row.amp && row.toFill > 0).length"
                    :ui="{ ring: 'ring-1 ring-primary dark:ring-primary m-2' }">
                    <UTable :rows="workByAmpArray.filter(row => row.amp && row.toFill > 0)" :columns="ampColumns">
                        <template #goToTicket-header>
                            <span class="flex flex-row items-center align-middle">
                                <UButton icon="i-material-symbols-list-alt-outline-rounded"
                                    @click="goToAmpTicketList(workByAmpArray.filter(row => row.amp && row.toFill > 0).map(row => row.amp))"
                                    class="mr-2" />
                                All
                            </span>
                        </template>
                        <template #goToTicket-data="{ row }">
                            <UButton icon="i-heroicons-check" color="green" @click="validateAmpInput(row.amp, true)" />
                            <UButton v-if="row.amp" icon="i-heroicons-arrow-right-circle" @click="goToAmpTicket(row.amp)"
                                class="ml-2" />
                            <span v-else class="w-8"></span>
                        </template>
                    </UTable>
                </UCard>
                <UCard v-else :ui="{ ring: 'ring-1 ring-primary dark:ring-primary m-2' }">You're up to date in
                    AMP,
                    congrats !</UCard>
            </template>
            <template #all>
                <UCard :ui="{ base: 'overflow-auto', ring: 'ring-1 ring-primary dark:ring-primary m-2' }">
                    <UTable :rows="workByAmpArray.filter(row => row.amp)" :columns="ampColumns">
                        <template #goToTicket-header>
                            <span class="flex flex-row items-center align-middle">
                                <UButton icon="i-material-symbols-list-alt-outline-rounded"
                                    @click="goToAmpTicketList(workByAmpArray.map(row => row.amp))" class="mr-2" />
                                All
                            </span>
                        </template>
                        <template #goToTicket-data="{ row }">
                            <UButton v-if="row.amp" icon="i-heroicons-arrow-right-circle" @click="goToAmpTicket(row.amp)" />
                            <span v-else class="w-8"></span>
                        </template>
                    </UTable>
                </UCard>
            </template>
        </UAccordion>
    </UCard>
</template>