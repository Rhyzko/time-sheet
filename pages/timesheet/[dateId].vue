<script setup lang="ts">
definePageMeta({
    validate: async (currentRoute) => {
        if (typeof currentRoute.params.dateId !== 'string') {
            return false;
        }
        const regex = /^(19|20)\d{2}-(0[1-9]|1[0-2])$/
        return regex.test(currentRoute.params.dateId)
    }
})

const route = useRoute()
const store = useTimesheetStore()

const { timeSheetRowsStyled, isTimeSheetCreated, currentDate } = storeToRefs(store)

const { getTimesheet, updateTimesheet, createTimesheet, checkRow, splitDay } = store

const edited = ref(false)
const chartPanelOpened = ref(false)
const ampPanelOpened = ref(false)

const saveToast = useToast()

const { clientList, fetchClients } = useTimeSheetDatabase()

const dayDisplayMode = ref(false)
const copiedRow = ref<TimeRow | undefined>(undefined)

const setDayDisplayMode = () => {
    dayDisplayMode.value = !dayDisplayMode.value
}

const updateTimeSheet = async () => {
    const success = await updateTimesheet()
    if (success) {
        saveToast.add({
            title: 'Time sheet saved',
            description: 'Your time sheet has been saved',
            icon: 'success',
            timeout: 5000,
        })
        edited.value = false;
    } else {
        saveToast.add({
            title: 'Error',
            description: 'An error occured while saving your time sheet',
            icon: 'error',
            timeout: 5000,
        })
    }
};

const setNextMonth = async () => {
    const nextMonthDateId = useDateFormat(currentDate.value.setMonth(currentDate.value.getMonth() + 1), 'YYYY-MM').value;
    await navigateTo(`/timesheet/${nextMonthDateId}`)
};

const setPrevMonth = async () => {
    const prevMonthDateId = useDateFormat(currentDate.value.setMonth(currentDate.value.getMonth() - 1), 'YYYY-MM').value;
    await navigateTo(`/timesheet/${prevMonthDateId}`)
};

const setDayOff = (row: any, index: number) => {
    timeSheetRowsStyled.value.splice(index, timeSheetRowsStyled.value.filter(r => r.date === row.date).length, { ...row, amp: '', ampFilled: false, client: '', comment: '', subject: '', timeSpent: '', type: 'off', class: 'bg-red-100 dark:bg-red-900' })
};

const setHalfDayOff = (row: any) => {
    const impactedRows = timeSheetRowsStyled.value.filter((r) => r.date === row.date)
    impactedRows.forEach((r) => {
        r.halfDay = true
    });
    checkRow(row);
};

const setDayOn = (row: any, index: number) => {
    timeSheetRowsStyled.value.splice(index, 1, { ...row, type: 'work' })
    checkRow(row)
};

const fillAmp = (row: any, index: number, fill: boolean) => {
    timeSheetRowsStyled.value.splice(index, 1, { ...row, ampFilled: fill })
};

const removeRow = (row: any, index: number) => {
    timeSheetRowsStyled.value.splice(index, 1);
    checkRow(row);
};

const copyRow = (row: any) => {
    copiedRow.value = { ...row, class: '', timeSpent: null, ampFilled: false };
};

const pasteRow = (row: any, index: number) => {
    timeSheetRowsStyled.value.splice(index, 1, { ...copiedRow.value, date: row.date });
    checkRow(row);
};

onMounted(async () => {
    await getTimesheet(route.params.dateId as string)
    await fetchClients()
    edited.value = false;
})

watch(timeSheetRowsStyled, () => {
    edited.value = true;
}, { deep: true })

const resetRow = (row: any, index: number) => {
    timeSheetRowsStyled.value.splice(index, timeSheetRowsStyled.value.filter(r => r.date === row.date).length, { ...row, amp: '', ampFilled: false, client: '', comment: '', subject: '', timeSpent: '', halfDay: false })
    checkRow(row);
};

const goToAmpTicket = (ticketNumber: string) => {
    window.open(`https://amp.service-now.com/nav_to.do?uri=/task_list.do?sysparm_query=sys_class_name=incident^ORsys_class_name=sc_req_item^number=${ticketNumber}^ORDERBYDESCsys_created_on&sysparm_first_row=1&sysparm_view=`, '_blank')
}

const createIncident = () => {
    window.open(`https://amp.service-now.com/nav_to.do?uri=%2Fcom.glideapp.servicecatalog_cat_item_view.do%3Fv%3D1%26sysparm_id%3D01588fa88712999033bb21f8dabb35aa%26sysparm_link_parent%3Dc767627f87b99594c0e931573cbb35ef%26sysparm_catalog%3D58a300344f2dcb0069a027201310c7ff%26sysparm_catalog_view%3Dcatalog_cms_internal%26sysparm_view%3Dcatalogs_default`, '_blank')
}

const createFeature = () => {
    window.open(`https://amp.service-now.com/nav_to.do?uri=%2Fcom.glideapp.servicecatalog_cat_item_view.do%3Fv%3D1%26sysparm_id%3D36683430c31ed9907bdb75d4e4013196%26sysparm_link_parent%3Dc767627f87b99594c0e931573cbb35ef%26sysparm_catalog%3D58a300344f2dcb0069a027201310c7ff%26sysparm_catalog_view%3Dcatalog_cms_internal%26sysparm_view%3D`, '_blank')
}

const workRepartitionDataset = computed(() => {
    return clientList.value.map((client) => {
        const workHours = timeSheetRowsStyled.value.filter((row) => row.client === client.label).reduce((acc, row) => acc + Number(row.timeSpent), 0);
        return {
            label: client.label,
            color: client.color,
            value: workHours
        }
    })
})

const workByAmp = computed(() => {
    return timeSheetRowsStyled.value.reduce((acc, row) => {
        const amp: string = row.amp ?? ''
        if (!acc[amp]) {
            acc[amp] = { amp, timeFilled: 0, timeToFill: 0, client: row.client ?? '' }
        }
        if (row.ampFilled) {
            acc[amp].timeFilled += Number(row.timeSpent)
        } else {
            acc[amp].timeToFill += Number(row.timeSpent)
        }
        return acc;
    }, {} as Record<string, { amp: string, client: string, timeFilled: number, timeToFill: number }>)
})

const workByAmpArray = computed(() => {
    return Object.keys(workByAmp.value).sort().map((key) => ({
        amp: key,
        client: workByAmp.value[key].client,
        // filled: workByAmp.value[key].timeFilled.toFixed(1).replace(/\.?0+$/, ''),
        // toFill: workByAmp.value[key].timeToFill.toFixed(1).replace(/\.?0+$/, ''),
        total: decimalToTime(workByAmp.value[key].timeFilled + workByAmp.value[key].timeToFill),
    }))
})

function decimalToTime(decimalValue: number) {
    const hours = Math.floor(decimalValue);
    const minutes = Math.round((decimalValue - hours) * 60);
    return `${hours.toString()}h ${minutes.toString()}m`;
}

const totalAmp = computed(() => {
    return timeSheetRowsStyled.value.filter((row) => row.ampFilled).reduce((acc, row) => acc + Number(row.timeSpent), 0)
})

const totalTime = computed(() => {
    return timeSheetRowsStyled.value.filter((row) => row.type === 'work').reduce((acc, row) => acc + Number(row.timeSpent), 0)
})

const getRowTimeTooltip = (row: TimeRow) => {
    if (row.type === 'work' && !row.halfDay) {
        const totalDay = timeSheetRowsStyled.value.filter((r) => r.date === row.date).reduce((acc, r) => acc + Number(r.timeSpent), 0)
        return totalDay.toFixed(1) === '7.7' ? null : `Il reste ${(7.7 - totalDay).toFixed(1)}h à saisir`
    }
}

const goToAmpTicketList = (ticketList: string[]) => {
    const formattedList = ticketList.filter(ticket => ticket).join('%252C')
    window.open(`https://amp.service-now.com/now/nav/ui/classic/params/target/task_list.do%3Fsysparm_query%3Dsys_class_name%253Dincident%255EORsys_class_name%253Dsc_req_item%255EnumberIN${formattedList}%255EORDERBYnumber%26sysparm_first_row%3D1%26sysparm_view%3D`, '_blank')
}
window.onbeforeunload = () => (edited.value ? true : null);
</script>

<template>
    <div class="w-max dark:bg-slate-800">
        <section class="flex flex-row gap-2 pl-2 py-1 w-full fixed mt-0 z-10 bg-white dark:bg-slate-800">
            <MonthBanner :monthAndYear="useDateFormat(currentDate, 'MMMM YYYY').value" @prevMonth="setPrevMonth"
                @nextMonth="setNextMonth"></MonthBanner>
            <span v-if="!isTimeSheetCreated">
                <UButton @click="createTimesheet" icon="i-material-symbols-create-new-folder" />
            </span>
            <span v-else>
                <UButton @click="updateTimeSheet" icon="i-material-symbols-save-outline-rounded" :disabled="!edited"
                    :color="edited ? 'primary' : 'gray'" />
            </span>
            <UTooltip :text="dayDisplayMode ? 'View all' : 'View today'">
                <UButton @click="setDayDisplayMode"
                    :icon="dayDisplayMode ? 'i-material-symbols-calendar-month-outline-rounded' : 'i-material-symbols-today-outline-rounded'">
                </UButton>
            </UTooltip>
            <UTooltip text="Display work repartition">
                <UButton @click="chartPanelOpened = true" icon="i-material-symbols-insert-chart" />
            </UTooltip>
            <UTooltip text="Display AMP view">
                <UButton @click="ampPanelOpened = true" icon="i-material-symbols-edit-document-rounded"></UButton>
            </UTooltip>
            <UButton @click="createIncident">Create Incident</UButton>
            <UButton @click="createFeature">Create Feature/Support</UButton>
        </section>
        <section v-if="isTimeSheetCreated" v-auto-animate class="top-10">
            <div class="flex flex-row items-center align-middle gap-2 py-1 bg-white dark:bg-slate-800 w-full">
                <span class="w-20"></span>
                <span class="w-20 font-semibold pl-4">Date</span>
                <span class="w-44 font-semibold">Client</span>
                <span class="w-64 font-semibold">Subject</span>
                <span class="w-10 font-semibold">Time</span>
                <span class="w-40 ml-10 font-semibold">AMP</span>
                <span class="font-semibold">Comment</span>
                <span class="w-8"></span>
            </div>
            <div>
                <div v-for="(row, index) in timeSheetRowsStyled" :key="`${row.date}-${index}`">
                    <div class="flex flex-row gap-2 py-1 items-center" :class="row.class"
                        v-if="dayDisplayMode ? row.date === useDateFormat(new Date(), 'DD-MM').value : true" v-auto-animate>
                        <section class="flex flex-row w-20 shrink-0 align-middle">
                            <UButton v-if="index > 0 && row.date === timeSheetRowsStyled[index - 1].date"
                                icon="i-heroicons-minus" @click="removeRow(row, index)" class="ml-12">
                            </UButton>
                            <UButton icon="i-heroicons-plus" @click="splitDay(row, index)" v-else-if="row.type === 'work'"
                                class="ml-2">
                            </UButton>
                            <UButton icon="i-material-symbols-beach-access-outline-rounded" @click="setDayOff(row, index)"
                                v-if="row.type === 'work' && (index === 0 || index > 0 && row.date !== timeSheetRowsStyled[index - 1].date) && !row.halfDay"
                                class="ml-2" />
                            <Icon v-if="row.halfDay" name="mdi:fraction-one-half" class="ml-4" />
                            <UButton v-if="row.type === 'off'" icon="i-heroicons-arrow-uturn-left"
                                @click="setDayOn(row, index)" class="ml-12" />
                        </section>
                        <span class="w-20 text-sm text-right shrink-0"> {{ row.date }}</span>
                        <USelectMenu v-model="row.client" :options="clientList" value-attribute="label"
                            v-if="row.type === 'work'" :ui="{ base: 'w-44' }">
                            <template #option="{ option }">
                                <span class="w-4 h-4 rounded-sm" :style="{ background: `${option.color}` }">
                                </span>
                                <span>{{ option.label }}</span>
                            </template>
                            <template #label>
                                <span v-if="row.client" class="w-4 h-4 rounded-sm"
                                    :style="{ background: `${clientList.find(c => c.label === row.client)?.color}` }" />
                                <span v-if="row.client">{{ row.client }}</span>
                                <span v-else class="h-5"></span>
                            </template>
                        </USelectMenu>
                        <UInput v-model="row.subject" v-if="row.type === 'work'" :ui="{ base: 'w-64' }">
                        </UInput>
                        <UTooltip :popper="{ placement: 'right' }">
                            <template #text>
                                <span>{{ getRowTimeTooltip(row) ?? '😎' }}</span>
                            </template>
                            <UInput v-model="row.timeSpent" :ui="{ base: 'w-10' }" @blur="checkRow(row)"
                                v-if="row.type === 'work'" />
                        </UTooltip>
                        <span v-if="row.type === 'work'" class="flex flex-row gap-2">
                            <UButton v-if="row.ampFilled" icon="i-heroicons-arrow-uturn-left" color="red"
                                @click="fillAmp(row, index, false)" variant="ghost" />
                            <UButton v-else-if="row.amp" icon="i-heroicons-check" color="green"
                                @click="fillAmp(row, index, true)" />
                            <span v-else class="w-8"></span>
                            <UInput v-model="row.amp" :color="row.ampFilled ? 'green' : 'white'" class="w-28" />
                            <UTooltip text="Go to AMP ticket" v-if="row.amp">
                                <UButton icon="i-heroicons-arrow-right-circle" v-if="row.amp"
                                    @click="goToAmpTicket(row.amp)" />
                            </UTooltip>
                            <span v-else class="w-8"></span>
                        </span>
                        <UInput v-model="row.comment" v-if="row.type === 'work'" :ui="{ base: 'w-64' }"></UInput>
                        <section class="flex flex-row gap-2" v-if="row.type === 'work'">
                            <UButton icon="i-material-symbols-content-copy-outline-rounded" @click="copyRow(row)" />
                            <UButton icon="i-material-symbols-content-paste-go-rounded" :disabled="!copiedRow"
                                class="disabled:text-gray-500" @click="pasteRow(row, index)" />
                            <UPopover
                                v-if="row.type === 'work' && (index === 0 || index > 0 && row.date !== timeSheetRowsStyled[index - 1].date)"
                                class="pr-2">
                                <UButton icon="i-material-symbols-more-vert" />
                                <template #panel>
                                    <section class="p-2 flex flex-col gap-2">
                                        <UButton icon="i-mdi-fraction-one-half" @click="setHalfDayOff(row)"
                                            class="disabled:text-gray-500" :disabled="row.halfDay">Half day work
                                        </UButton>
                                        <UButton icon="i-material-symbols-cleaning-services-rounded"
                                            @click="resetRow(row, index)">Clear the day</UButton>
                                        <UButton icon="i-material-symbols-content-copy-outline-rounded"
                                            @click="copyRow(row)">
                                            Copy row</UButton>
                                        <UButton icon="i-material-symbols-content-paste-go-rounded" :disabled="!copiedRow"
                                            class="disabled:text-gray-500" @click="pasteRow(row, index)">Paste row</UButton>
                                    </section>
                                </template>
                            </UPopover>
                        </section>
                    </div>
                    <UDivider :ui="{ border: { base: 'flex border-gray-400 dark:border-gray-800' } }"
                        v-if="!dayDisplayMode && row.type === 'work' && index < (timeSheetRowsStyled.length - 1) && row.date !== timeSheetRowsStyled[index + 1].date && timeSheetRowsStyled[index + 1].type !== 'weekend'">
                    </UDivider>
                </div>
            </div>
        </section>
        <section v-else>
            <USkeleton class="h-12 mt-5 w-full" />
            <USkeleton class="h-8 my-3 w-full" v-for="line in 10" />
        </section>
        <USlideover v-model="chartPanelOpened">
            <UCard class="flex flex-col flex-1"
                :ui="{ body: { base: 'flex-1' }, ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
                <template #header>
                    Work repartition
                </template>
                <DonutChart :dataset="workRepartitionDataset" />
            </UCard>
        </USlideover>
        <USlideover v-model="ampPanelOpened" :ui="{ width: 'w-screen max-w-[50%]' }" side="left">
            <UCard class="flex flex-col" :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
                <template #header>
                    AMP View
                </template>
                <UCard :ui="{ ring: 'ring-1 ring-primary dark:ring-gray-800' }">
                    <section class="flex flex-row items-center place-content-between">
                        <div class="flex flex-col text-sm text-primary">
                            <p>Chargeable time {{ totalAmp.toFixed(1) }}</p>
                            <p>Chargeability
                                <span class="text-sm font-medium">{{ ((totalAmp ?? 0) / (totalTime ?? 1) * 100).toFixed(1)
                                }}</span>
                                %
                            </p>
                        </div>
                        <div>
                            <UButton @click="goToAmpTicketList(workByAmpArray.map(row => row.amp))" class="ml-2"
                                icon="i-material-symbols-list-alt-outline-rounded" />
                        </div>
                    </section>
                </UCard>
                <UTable :rows="workByAmpArray" />
            </UCard>
        </USlideover>
        <UNotifications />
    </div>
</template>
<style lang="scss" scoped></style>
