<script setup lang="ts">
const colors = ["red", "orange", "amber"]
</script>

<template>
    <UPopover>
        <UButton icon="i-material-symbols-colors-rounded"></UButton>
        <template #panel>
            <UButton v-for="color in colors" :key="color"><span :class="`bg-${color}-500 w-4 h-4 rounded-sm`"
                    @click="$emit('selected', color)"></span>
            </UButton>
        </template>
    </UPopover>
</template>

<style lang="scss" scoped></style>