<script setup lang="ts">
import type { Database } from '~/types/supabase';

const supabase = useSupabaseClient<Database>();
const timeSheetRows = ref<TimeRow[]>([]);
const timeSheetRowsStyled = ref<TimeRow[]>([]);
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
      timeSheetRowsStyled.value = timeSheetRows.value.map((row) => {
        return {
          ...row,
          class: row.type === 'off' ? 'bg-red-100' : row.type === 'weekend' ? 'bg-gray-200' : 'py-0'
        }
      })
      console.log(parseInt('01'))
      timeSheetRowsStyled.value.filter(row => row.type === 'work' && row.date && parseInt(row.date.substring(0, 2)) <= new Date().getDate()).forEach((row) => {
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
  console.log('setMonth');
  currentDate.value = new Date(currentDate.value.setMonth(currentDate.value.getMonth() + unit));
  await getTimeSheet();

};

const setDayOff = (row: any, index: number) => {
  timeSheetRowsStyled.value.splice(index, 1, { ...row, type: 'off', class: 'bg-red-100' })
};

const currentDate = ref(new Date())

let columns = [
  {
    key: 'splitDay'
  },
  {
    key: 'off'
  },
  {
    key: 'date',
    label: 'date',
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
    comment: ''
  });
};

onMounted(async () => {
  setMonth(0)
})

const checkRow = (row: any) => {
  const impactedRows = timeSheetRowsStyled.value.filter((r) => r.date === row.date);
  const total = impactedRows.reduce((acc, r) => acc + Number(r.timeSpent), 0);
  impactedRows.forEach((r) => {
    r.class = total === 7.7 ? 'bg-green-100' : 'bg-orange-100';
  });
};

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
    <UTable :columns="columns" :rows="timeSheetRowsStyled" :ui="{ td: { padding: 'py-1 px-1' } }">
      <template #splitDay-data="{ row, index }">
        <Icon name="i-heroicons-plus" @click="splitDay(row, index)" v-if="row.type === 'work'" />
        <span v-else></span>
      </template>
      <template #off-data="{ row, index }">
        <Icon name="i-material-symbols:beach-access" @click="setDayOff(row, index)" v-if="row.type === 'work'" />
        <span v-else></span>
      </template>
      <template #date-data="{ row }">
        <span> {{ row.date }}</span>
      </template>
      <template #client-data="{ row }">
        <UInput v-model="row.client"></UInput>
      </template>
      <template #project-data="{ row }">
        <UInput v-model="row.project"></UInput>
      </template>
      <template #timeSpent-data="{ row }">
        <UInput v-model="row.timeSpent" class="w-14" @blur="checkRow(row)"></UInput>
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

<style lang="scss" scoped>
td {
  padding: 0 !important;
}
</style>
