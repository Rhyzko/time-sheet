<script setup lang="ts">
const columns = [{
    key: 'splitDay'
}, {
    key: 'date',
    label: 'date'
}, {
    key: 'client',
    label: 'Client'
}, {
    key: 'project',
    label: 'Project'
}, {
    key: 'timeSpent',
    label: 'Time Spent'
}, {
    key: 'amp',
    label: 'AMP'
}, {
    key: 'comment',
    label: 'Comment'
}]

const people = ref<TimeRow[]>([])

const formatted = useDateFormat(useNow(), 'YYYY-MM-DD HH:mm:ss')
const test = () => {
    console.log(people.value);
}

const formatMonthTable = (month: number) => {
    const numDaysInMonth = new Date(2023, month, 0).getDate();
    for (let i = 1; i <= numDaysInMonth; i++) {
        const date = new Date(2023, month - 1, i);
        people.value.push({
            date: useDateFormat(date, 'DD-MM').value,
            client: '',
            project: '',
            timeSpent: 0,
            comment: ''
        });
    }
}

const splitDay = (row: any, index: number) => {
    console.log(index);
    people.value.splice(index + 1, 0, {
        date: row.date,
        client: '',
        project: '',
        timeSpent: 0,
        comment: ''
    })
}

formatMonthTable(10);
</script>

<template>
    <UTable :columns="columns" :rows="people">
        <template #splitDay-data="{ row, index }">
            <UIcon name="i-heroicons-plus" @click="splitDay(row, index)" />
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
    <UButton @click="test">Test</UButton>
</template>

<style lang="scss" scoped></style>