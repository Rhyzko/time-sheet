<script setup lang="ts">
const currentDate = ref(new Date())
const { getUser } = useUserStore()

getUser()
await navigateTo(`dashboard/${useDateFormat(currentDate.value, 'YYYY-MM').value}`)
</script>
<template></template>
