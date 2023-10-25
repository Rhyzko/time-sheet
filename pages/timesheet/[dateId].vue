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
const supabase = useSupabaseClient<Database>();
const timeSheetRows = ref<TimeRow[]>([]);
const timeSheetRowsStyled = ref<TimeRow[]>([]);
const isTimeSheetCreated = ref(false);
const currentDate = ref(new Date())
const monthTimeSheet = ref<TimeSheet | undefined>(undefined);

const user = useSupabaseUser();

const edited = ref(false);
const saveToast = useToast();

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
    edited.value = false;
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

window.onbeforeunload = () => (edited.value ? true : null);
</script>

<template>
    <div>
        <section class="flex flex-row">
            <MonthBanner :monthAndYear="useDateFormat(currentDate, 'MMMM YYYY').value" @prevMonth="setPrevMonth"
                class="mr-2" @nextMonth="setNextMonth"></MonthBanner>
            <span v-if="!isTimeSheetCreated">
                <UButton @click="createTimeSheet" icon="i-material-symbols-create-new-folder" />
            </span>
            <span v-else>
                <UButton @click="updateTimeSheet" icon="i-material-symbols-save-outline-rounded" :disabled="!edited"
                    :color="edited ? 'primary' : 'gray'" />
            </span>
        </section>
        <section v-if="isTimeSheetCreated">
            <UTable :columns="columns" :rows="timeSheetRowsStyled" :ui="{ td: { padding: 'py-1 px-1' } }" v-auto-animate>
                <template #actions-data="{ row, index }">
                    <UButton v-if="index > 0 && row.date === timeSheetRowsStyled[index - 1].date" icon="i-heroicons-minus"
                        @click="removeRow(row, index)">
                    </UButton>
                    <UButton icon="i-heroicons-plus" @click="splitDay(row, index)" v-else-if="row.type === 'work'">
                    </UButton>
                    <span v-else></span>
                    <UButton icon="i-material-symbols-beach-access-outline-rounded" @click="setDayOff(row, index)"
                        v-if="row.type === 'work'" class="ml-2" />
                    <UButton v-if="row.type === 'off'" icon="i-heroicons-arrow-uturn-left" @click="setDayOn(row, index)"
                        class="ml-2" />
                    <span v-else></span>
                </template>
                <template #date-data="{ row }">
                    <span> {{ row.date }}</span>
                </template>
                <template #client-data="{ row }">
                    <UInput v-model="row.client" v-if="row.type === 'work'"></UInput>
                </template>
                <template #subject-data="{ row }">
                    <UInput v-model="row.subject" v-if="row.type === 'work'"></UInput>
                    <span v-else></span>
                </template>
                <template #timeSpent-data="{ row }">
                    <UInput v-model="row.timeSpent" class="w-14" @blur="checkRow(row)" v-if="row.type === 'work'" />
                    <span v-else></span>
                </template>
                <template #ampCheck-data="{ row }">
                    <UInput v-model="row.timeSpent" class="w-14" @blur="checkRow(row)" v-if="row.type === 'work'" />
                    <span v-else></span>
                </template>
                <template #amp-data="{ row, index }">
                    <span v-if="row.type === 'work'" class="flex flex-row gap-2">
                        <UButton v-if="row.ampFilled" icon="i-heroicons-arrow-uturn-left" color="red"
                            @click="fillAmp(row, index, false)" variant="ghost" />
                        <UButton v-else icon="i-heroicons-check" color="green" @click="fillAmp(row, index, true)" />
                        <UInput v-model="row.amp" :color="row.ampFilled ? 'green' : 'white'" />
                        <UButton icon="i-heroicons-arrow-right-circle" />
                    </span>
                    <span v-else></span>
                </template>
                <template #comment-data="{ row }">
                    <UInput v-model="row.comment" v-if="row.type === 'work'"></UInput>
                </template>
            </UTable>
        </section>
        <section v-else>
            <USkeleton class="h-12 mt-5 w-full" />
            <USkeleton class="h-8 my-3 w-full" v-for=" line  in  10 " />
        </section>
        <UNotifications />
    </div>
</template>

<style lang="scss" scoped></style>
