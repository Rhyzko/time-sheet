<script setup lang="ts">
import type { Database } from '~/types/supabase';

const supabase = useSupabaseClient<Database>();
const timeSheetRows = ref<TimeRow[]>([]);
const timeSheetRowsStyled = ref<TimeRow[]>([]);
const isTimeSheetCreated = ref(false);

const monthTimeSheet = ref<TimeSheet | undefined>(undefined);

const user = useSupabaseUser();

const edited = ref(false);
const saveToast = useToast();

const getTimeSheet = async () => {
  const { data, error } = await supabase.from('timesheets').select('*').eq('userId', user.value?.id ?? '').eq('label', useDateFormat(currentDate.value, 'YYYY-MM').value)
  if (error) {
    console.error(error);
  } else {
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
      project: '',
      timeSpent: 0,
      comment: '',
      type: getDayType(date)
    });
  }
};

const setMonth = async (unit: number) => {
  currentDate.value = new Date(currentDate.value.setMonth(currentDate.value.getMonth() + unit));
  await getTimeSheet();
  edited.value = false;
};

const setDayOff = (row: any, index: number) => {
  timeSheetRowsStyled.value.splice(index, timeSheetRowsStyled.value.filter(r => r.date === row.date).length, { ...row, type: 'off', class: 'bg-red-100' })
};

const setDayOn = (row: any, index: number) => {
  timeSheetRowsStyled.value.splice(index, 1, { ...row, type: 'work', class: 'bg-orange-100' })
};

const currentDate = ref(new Date())

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
    key: 'project',
    label: 'Project'
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
    project: '',
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
  setMonth(0)
})

watch(timeSheetRowsStyled, (newValue, oldValue) => {
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
  <section class="flex flex-row">
    <MonthBanner :monthAndYear="useDateFormat(currentDate, 'MMMM YYYY').value" @prevMonth="setMonth(-1)" class="mr-2"
      @nextMonth="setMonth(1)"></MonthBanner>
    <span v-if="!isTimeSheetCreated">
      <UButton @click="createTimeSheet" icon="i-material-symbols-create-new-folder" />
    </span>
    <span v-else>
      <UButton @click="updateTimeSheet" icon="i-material-symbols-save-outline-rounded" :disabled="!edited"
        :color="edited ? 'primary' : 'gray'" />
    </span>
  </section>
  <section v-if="isTimeSheetCreated">
    <UTable :columns="columns" :rows="timeSheetRowsStyled" :ui="{ td: { padding: 'py-1 px-1' } }">
      <template #actions-data="{ row, index }">
        <UButton v-if="index > 0 && row.date === timeSheetRowsStyled[index - 1].date" icon="i-heroicons-minus"
          @click="removeRow(row, index)">
        </UButton>
        <UButton icon="i-heroicons-plus" @click="splitDay(row, index)" v-else-if="row.type === 'work'"></UButton>
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
      <template #project-data="{ row }">
        <UInput v-model="row.project" v-if="row.type === 'work'"></UInput>
      </template>
      <template #timeSpent-data="{ row }">
        <UInput v-model="row.timeSpent" class="w-14" @blur="checkRow(row)" v-if="row.type === 'work'" />
        <span v-else></span>
      </template>
      <template #amp-data="{ row }">
        <span v-if="row.type === 'work'" class="flex flex-row">
          <UInput v-model="row.amp" />
          <UButton icon="i-heroicons-arrow-right-circle" class="ml-2" />
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
    <USkeleton class="h-8 my-3 w-full" v-for="line in 10" />
  </section>
  <UNotifications />
</template>

<style lang="scss" scoped></style>
