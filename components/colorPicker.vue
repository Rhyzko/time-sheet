<script setup lang="ts">
defineProps({
    disabled: Boolean,
})

const { colors } = useColor()
</script>

<template>
    <UPopover>
        <UButton icon="i-material-symbols-colors-rounded" :disabled="disabled"></UButton>
        <template #panel>
            <section class="flex flex-wrap w-52 gap-1 m-4">
                <UTooltip v-for="color in colors" :key="color.code" :text="color.label">
                    <UButton color="gray"><span :class="`bg-${color.label}-500 w-4 h-4 rounded-sm`"
                            @click="$emit('selected', color)"></span>
                    </UButton>
                </UTooltip>
            </section>
        </template>
    </UPopover>
</template>

<style lang="scss" scoped></style>