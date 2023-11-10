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
const { timeSheetRowsStyled, isTimeSheetCreated, currentDate, timeSheetEdited } = storeToRefs(store)
const { getTimesheet, updateTimesheet, createTimesheet, checkRow, splitDay } = store

const { goToAmpTicket, createFeature, createIncident, goToClientAmpTicketList } = useAmp()

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
        timeSheetEdited.value = false;
    } else {
        saveToast.add({
            title: 'Error',
            description: 'An error occured while saving your time sheet',
            icon: 'error',
            timeout: 5000,
        })
    }
};

const saveTimesheet = async () => {
    if (timeSheetEdited.value) {
        await updateTimeSheet()
    }
}

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
    timeSheetEdited.value = false;
})

const resetRow = (row: any, index: number) => {
    timeSheetRowsStyled.value.splice(index, timeSheetRowsStyled.value.filter(r => r.date === row.date).length, { ...row, amp: '', ampFilled: false, client: '', comment: '', subject: '', timeSpent: '', halfDay: false })
    checkRow(row);
};

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
        toFill: workByAmp.value[key].timeToFill,
        total: decimalToTime(workByAmp.value[key].timeFilled + workByAmp.value[key].timeToFill),
    }))
})

function decimalToTime(decimalValue: number) {
    const hours = Math.floor(decimalValue);
    const minutes = Math.round((decimalValue - hours) * 60);
    if (isNaN(hours) || isNaN(minutes)) return null;
    return `${hours.toString()}h ${minutes.toString()}m`;
}

const getRowTimeTooltip = (row: TimeRow) => {
    if (row.type === 'work' && !row.halfDay) {
        const totalDay = timeSheetRowsStyled.value.filter((r) => r.date && r.date === row.date).reduce((acc, r) => acc + Number(r.timeSpent), 0)
        if (isNaN(totalDay)) return 'Il reste 7.7h à saisir'
        return totalDay.toFixed(1) === '7.7' ? null : `Il reste ${(7.7 - totalDay).toFixed(1)}h à saisir`
    }
}

const checkRowAndAmpFilled = (row: TimeRow) => {
    if (row.ampFilled === true) {
        row.ampFilled = false
    }
    checkRow(row)
}

const { ctrl_s } = useMagicKeys({
    passive: false,
    onEventFired(e) {
        if (e.ctrlKey && e.key === 's' && e.type === 'keydown')
            e.preventDefault()
    },
})

whenever(ctrl_s, saveTimesheet)
window.onbeforeunload = () => (timeSheetEdited.value ? true : null);
</script>

<template>
    <div class="w-max dark:bg-slate-800">
        <section class="flex flex-row gap-2 pl-2 py-1 w-full fixed mt-0 z-10 bg-white dark:bg-slate-800">
            <MonthBanner :monthAndYear="useDateFormat(currentDate, 'MMMM YYYY').value" @prevMonth="setPrevMonth"
                @nextMonth="setNextMonth"></MonthBanner>
            <span v-if="!isTimeSheetCreated">
                <UButton @click="createTimesheet" icon="i-material-symbols-create-new-folder" />
            </span>
            <span v-else class="flex flex-row gap-2">
                <UTooltip text="will be available soon 😉">
                    <UButton icon="i-mdi-undo" disabled></UButton>
                </UTooltip>
                <UTooltip text="will be available soon 😉">
                    <UButton icon="i-mdi-redo" disabled></UButton>
                </UTooltip>
                <UButton @click="updateTimeSheet" icon="i-material-symbols-save-outline-rounded"
                    :disabled="!timeSheetEdited" :color="timeSheetEdited ? 'primary' : 'gray'" />
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
                        v-if="dayDisplayMode ? (row.date === useDateFormat(new Date(), 'DD-MM').value || row.date === useDateFormat(new Date(), 'ddd DD-MM').value) : true"
                        v-auto-animate>
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
                        <UTooltip :popper="{ placement: 'right' }" v-if="row.type === 'work'">
                            <template #text>
                                <span>{{ getRowTimeTooltip(row) ?? '😎' }}</span>
                            </template>
                            <UInput v-model="row.timeSpent" :ui="{ base: 'w-10' }" @focus="$event.target.select()"
                                @change="checkRowAndAmpFilled(row)" />
                        </UTooltip>
                        <span v-if="row.type === 'work'" class="flex flex-row gap-2">
                            <UButton v-if="row.ampFilled" icon="i-heroicons-arrow-uturn-left" color="red"
                                @click="fillAmp(row, index, false)" variant="ghost" />
                            <UButton v-else-if="row.amp" icon="i-heroicons-check" color="green"
                                @click="fillAmp(row, index, true)" />
                            <UButton v-else-if="!row.amp && row.client" icon="i-material-symbols-view-list-outline" @click="goToClientAmpTicketList(row.client)"></UButton>
                            <span v-else class="w-8"></span>
                            <UInput v-model="row.amp" :color="row.ampFilled ? 'green' : 'white'" class="w-28" />
                            <UTooltip :text="`Go to AMP ticket (${workByAmpArray.find(r => r.amp === row.amp)?.total})`"
                                v-if="row.amp">
                                <UButton icon="i-heroicons-arrow-right-circle" @click="goToAmpTicket(row.amp)" />
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
                    <UDivider :ui="{ border: { base: 'flex border-gray-400 dark:border-white-200' } }"
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
            <WorkRepartition :categories="clientList" :rows="timeSheetRowsStyled" />
        </USlideover>
        <USlideover v-model="ampPanelOpened" :ui="{ width: 'w-screen max-w-[50%]' }" side="left">
            <AmpView :workByAmpArray="workByAmpArray" />
        </USlideover>
        <UNotifications />
    </div>
</template>
<style lang="scss" scoped></style>
