<script setup lang="ts">
defineProps({
    monthAndYear: String
});
</script>

<template>
    <div class="flex flex-row items-center justify-center">
        <UButton icon="i-material-symbols-chevron-left" @click="$emit('prevMonth')" />
        <span class="w-40 text-center">{{ monthAndYear }}</span>
        <UButton icon="i-material-symbols-chevron-right" @click="$emit('nextMonth')" />

    </div>
</template>
<style lang="scss" scoped></style>