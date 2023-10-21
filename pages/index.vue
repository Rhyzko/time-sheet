<script setup lang="ts">
import type { Database } from '~/types/supabase';

const supabase = useSupabaseClient<Database>();
const timeSheetRows = ref<TimeRow[]>([]);
const isTimeSheetCreated = ref(false);

const monthTimeSheet = ref<TimeSheet | undefined>(undefined);


const user = useSupabaseUser();

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
    }
  }
};

const createTimeSheet = async () => {
  formatMonthTable(currentDate.value.getMonth() + 1);
  const { data, error } = await supabase.from('timesheets').upsert([{ label: useDateFormat(currentDate.value, 'YYYY-MM').value, userId: user.value?.id ?? '', content: timeSheetRows.value }]).select('*')
  if (error) {
    console.error(error);
  } else {
    isTimeSheetCreated.value = true;
    monthTimeSheet.value = data[0];
  }
};

const updateTimeSheet = async () => {
  const { data, error } = await supabase.from('timesheets').update({ content: timeSheetRows.value }).match({ id: monthTimeSheet.value?.id ?? 0 }).select('*')
  if (error) {
    console.error(error);
  } else {
    monthTimeSheet.value = data[0];
  }
};

const formatMonthTable = (month: number) => {
  const numDaysInMonth = new Date(2023, month, 0).getDate();
  timeSheetRows.value = [];
  for (let i = 1; i <= numDaysInMonth; i++) {
    const date = new Date(2023, month - 1, i);
    timeSheetRows.value.push({
      date: useDateFormat(date, 'DD-MM').value,
      client: '',
      project: '',
      timeSpent: 0,
      comment: ''
    });
  }
};

const setMonth = async (unit: number) => {
  console.log('setMonth');
  currentDate.value = new Date(currentDate.value.setMonth(currentDate.value.getMonth() + unit));
  await getTimeSheet();

};

const currentDate = ref(new Date())

// await getTimeSheet();

const columns = [
  {
    key: 'splitDay'
  },
  {
    key: 'date',
    label: 'date'
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
    label: 'Time Spent'
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
  console.log(index);
  timeSheetRows.value.splice(index + 1, 0, {
    date: row.date,
    client: '',
    project: '',
    timeSpent: 0,
    comment: ''
  });
};

onMounted(async () => {
  setMonth(0)
})

</script>

<template>
  <MonthBanner :monthAndYear="useDateFormat(currentDate, 'MMMM YYYY').value" @prevMonth="setMonth(-1)"
    @nextMonth="setMonth(1)"></MonthBanner>
  {{ user?.id }}

  <div v-if="!isTimeSheetCreated">
    <UButton @click="createTimeSheet">Create</UButton>
  </div>
  <div v-else>
    <UButton @click="updateTimeSheet">
      <Icon name="i-heroicons-check"></Icon> Update
    </UButton>
    <UTable :columns="columns" :rows="timeSheetRows">
      <template #splitDay-data="{ row, index }">
        <Icon name="i-heroicons-plus" @click="splitDay(row, index)" />
      </template>
      <template #date-data="{ row }">
        <UInput v-model="row.date"></UInput>
      </template>
      <template #client-data="{ row }">
        <UInput v-model="row.client"></UInput>
      </template>
      <template #project-data="{ row }">
        <UInput v-model="row.project"></UInput>
      </template>
      <template #timeSpent-data="{ row }">
        <UInput v-model="row.timeSpent"></UInput>
      </template>
      <template #amp-data="{ row }">
        <UInput v-model="row.amp"></UInput>
      </template>
      <template #comment-data="{ row }">
        <UInput v-model="row.comment"></UInput>
      </template>
    </UTable>
  </div>
</template>

<style lang="scss" scoped></style>
