<script setup lang="ts">
defineProps({
    monthAndYear: String
});
</script>

<template>
    <div>
        <UButton>
            <Icon name="i-heroicons-arrow-left-circle" @click="$emit('prevMonth')" size="1.5em"></Icon>
        </UButton>
        {{ monthAndYear }}
        <UButton>
            <Icon name="i-heroicons-arrow-right-circle" @click="$emit('nextMonth')" size="1.5em"></Icon>
        </UButton>
    </div>
</template>

<style lang="scss" scoped></style>