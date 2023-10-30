<script setup lang="ts">
import type { Database } from '~/types/supabase';
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
const supabase = useSupabaseClient<Database>()
const timeSheetRows = ref<TimeRow[]>([])
const timeSheetRowsStyled = ref<TimeRow[]>([])
const isTimeSheetCreated = ref(false)
const currentDate = ref(new Date())
const monthTimeSheet = ref<TimeSheet | undefined>(undefined)

const user = useSupabaseUser()

const edited = ref(false)
const chartPanelOpened = ref(false)
const saveToast = useToast()

const { clientList, fetchClients } = useTimeSheetDatabase()

const getTimeSheet = async () => {
    const { data, error } = await supabase.from('timesheets').select('*').eq('userId', user.value?.id ?? '').eq('label', route.params.dateId)
    if (error) {
        console.error(error);
    } else {
        currentDate.value = new Date(route.params.dateId as string);
        if (!data || !data.length) {
            isTimeSheetCreated.value = false;
        } else {
            isTimeSheetCreated.value = true;
            monthTimeSheet.value = data[0];
            timeSheetRows.value = monthTimeSheet.value?.content ?? [];
            timeSheetRowsStyled.value = timeSheetRows.value.map((row) => {
                return {
                    ...row,
                    class: row.type === 'off' ? 'bg-red-100' : row.type === 'weekend' ? 'bg-gray-200' : 'py-0'
                }
            })
            timeSheetRowsStyled.value.filter(row => row.type === 'work'
                && row.date && parseInt(row.date.substring(0, 2)) <= new Date().getDate()
            ).forEach((row) => {
                checkRow(row);
            });
        }
    }
};

const createTimeSheet = async () => {
    formatMonthTable(currentDate.value.getMonth() + 1);
    const { data, error } = await supabase.from('timesheets').upsert([{ label: useDateFormat(currentDate.value, 'YYYY-MM').value, userId: user.value?.id ?? '', content: timeSheetRowsStyled.value }]).select('*')
    if (error) {
        console.error(error);
    } else {
        isTimeSheetCreated.value = true;
        monthTimeSheet.value = data[0];
    }
};

const updateTimeSheet = async () => {
    const { data, error } = await supabase.from('timesheets').update({ content: timeSheetRowsStyled.value }).match({ id: monthTimeSheet.value?.id ?? 0 }).select('*')
    if (error) {
        console.error(error);
    } else {
        monthTimeSheet.value = data[0];
        saveToast.add({
            title: 'Time sheet saved',
            description: 'Your time sheet has been saved',
            icon: 'success',
            timeout: 5000,
        })
        edited.value = false;
    }
};

const getDayType = (date: Date) => {
    const day = date.getDay();
    if (day === 0 || day === 6) {
        return 'weekend';
    }
    return 'work';
};

const formatMonthTable = (month: number) => {
    const numDaysInMonth = new Date(2023, month, 0).getDate();
    timeSheetRowsStyled.value = [];
    for (let i = 1; i <= numDaysInMonth; i++) {
        const date = new Date(2023, month - 1, i);
        timeSheetRowsStyled.value.push({
            date: useDateFormat(date, 'DD-MM').value,
            client: '',
            subject: '',
            timeSpent: 0,
            comment: '',
            type: getDayType(date)
        });
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
    timeSheetRowsStyled.value.splice(index, timeSheetRowsStyled.value.filter(r => r.date === row.date).length, { ...row, type: 'off', class: 'bg-red-100' })
};

const setDayOn = (row: any, index: number) => {
    timeSheetRowsStyled.value.splice(index, 1, { ...row, type: 'work', class: 'bg-orange-100' })
};

const fillAmp = (row: any, index: number, fill: boolean) => {
    timeSheetRowsStyled.value.splice(index, 1, { ...row, ampFilled: fill })
};

let columns = [
    {
        key: 'actions'
    },
    {
        key: 'date',
        label: 'Date',
    },
    {
        key: 'client',
        label: 'Client'
    },
    {
        key: 'subject',
        label: 'Subject'
    },
    {
        key: 'timeSpent',
        label: 'Time'
    },
    {
        key: 'amp',
        label: 'AMP'
    },
    {
        key: 'comment',
        label: 'Comment'
    }
];

const splitDay = (row: any, index: number) => {
    timeSheetRowsStyled.value.splice(index + 1, 0, {
        date: row.date,
        client: '',
        subject: '',
        timeSpent: 0,
        comment: '',
        class: row.class,
        type: row.type
    });
};

const removeRow = (row: any, index: number) => {
    timeSheetRowsStyled.value.splice(index, 1);
    checkRow(row);
};

onMounted(async () => {
    await getTimeSheet()
    await fetchClients()
    edited.value = false;
    console.log(workRepartitionDataset.value)
})

watch(timeSheetRowsStyled, () => {
    edited.value = true;
}, { deep: true })

const checkRow = (row: any) => {
    const impactedRows = timeSheetRowsStyled.value.filter((r) => r.date === row.date);
    const total = impactedRows.reduce((acc, r) => acc + Number(r.timeSpent), 0);
    impactedRows.forEach((r) => {
        r.class = total === 7.7 ? 'bg-green-100' : 'bg-orange-100';
    });
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
window.onbeforeunload = () => (edited.value ? true : null);
</script>

<template>
    <div>
        <section class="flex flex-row gap-2">
            <MonthBanner :monthAndYear="useDateFormat(currentDate, 'MMMM YYYY').value" @prevMonth="setPrevMonth"
                @nextMonth="setNextMonth"></MonthBanner>
            <span v-if="!isTimeSheetCreated">
                <UButton @click="createTimeSheet" icon="i-material-symbols-create-new-folder" />
            </span>
            <span v-else>
                <UButton @click="updateTimeSheet" icon="i-material-symbols-save-outline-rounded" :disabled="!edited"
                    :color="edited ? 'primary' : 'gray'" />
            </span>
            <UButton @click="createIncident">Create Incident</UButton>
            <UButton @click="createFeature">Create Feature/Support</UButton>
            <UButton @click="chartPanelOpened = true" icon="i-material-symbols-insert-chart" />
        </section>
        <section v-if="isTimeSheetCreated" class="w-full" v-auto-animate>
            <div class="flex flex-row items-center gap-2 py-1">
                <span class="w-20 "></span>
                <span class="w-12 font-semibold">Date</span>
                <span class="w-40 font-semibold">Client</span>
                <span class="w-64 font-semibold">Subject</span>
                <span class="w-10 font-semibold">Time</span>
                <span class="w-40 ml-10 font-semibold">AMP</span>
                <span class="font-semibold">Comment</span>
            </div>
            <div v-for="(row, index) in timeSheetRowsStyled" :key="`${row.date}-${index}`"
                class="flex flex-row gap-2 py-1 items-center" :class="row.class">
                <section class="w-20">
                    <UButton v-if="index > 0 && row.date === timeSheetRowsStyled[index - 1].date" icon="i-heroicons-minus"
                        @click="removeRow(row, index)" class="ml-10">
                    </UButton>
                    <UButton icon="i-heroicons-plus" @click="splitDay(row, index)" v-else-if="row.type === 'work'">
                    </UButton>
                    <UButton icon="i-material-symbols-beach-access-outline-rounded" @click="setDayOff(row, index)"
                        v-if="row.type === 'work' && index > 0 && row.date !== timeSheetRowsStyled[index - 1].date"
                        class="ml-2" />
                    <UButton v-if="row.type === 'off'" icon="i-heroicons-arrow-uturn-left" @click="setDayOn(row, index)"
                        class="ml-10" />
                </section>
                <span class="w-10 text-sm"> {{ row.date }}</span>
                <USelectMenu v-model="row.client" :options="clientList" value-attribute="label" v-if="row.type === 'work'"
                    class="w-40" />
                <UInput v-model="row.subject" v-if="row.type === 'work'" class="w-64"></UInput>
                <UInput v-model="row.timeSpent" class="w-10" @blur="checkRow(row)" v-if="row.type === 'work'" />
                <span v-if="row.type === 'work'" class="flex flex-row gap-2">
                    <UButton v-if="row.ampFilled" icon="i-heroicons-arrow-uturn-left" color="red"
                        @click="fillAmp(row, index, false)" variant="ghost" />
                    <UButton v-else icon="i-heroicons-check" color="green" @click="fillAmp(row, index, true)" />
                    <UInput v-model="row.amp" :color="row.ampFilled ? 'green' : 'white'" class="w-28" />
                    <UButton icon="i-heroicons-arrow-right-circle" v-if="row.amp" @click="goToAmpTicket(row.amp)" />
                    <span v-else class="w-8"></span>
                </span>
                <UInput v-model="row.comment" v-if="row.type === 'work'"></UInput>
            </div>
        </section>
        <section v-else>
            <USkeleton class="h-12 mt-5 w-full" />
            <USkeleton class="h-8 my-3 w-full" v-for=" line  in  10 " />
        </section>
        <USlideover v-model="chartPanelOpened">
            <!-- Content -->
            <UCard class="flex flex-col flex-1"
                :ui="{ body: { base: 'flex-1' }, ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
                <template #header>
                    Work repartition
                </template>
                <DonutChart :dataset="workRepartitionDataset" />
            </UCard>
        </USlideover>
        <UNotifications />
    </div>
</template>

<style lang="scss" scoped></style>
