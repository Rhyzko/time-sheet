<script setup lang="ts">
const currentDate = ref(new Date())
const { getUser } = useUserStore()
getUser()
await navigateTo(`timesheet/${useDateFormat(currentDate.value, 'YYYY-MM').value}`)
</script>
<template></template>
