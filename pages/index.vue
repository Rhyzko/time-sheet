<script setup lang="ts">
const currentDate = ref(new Date())
await navigateTo(`timesheet/${useDateFormat(currentDate.value, 'YYYY-MM').value}`)
</script>
<template></template>
