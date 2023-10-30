<script setup lang="ts">
const colors = [
    { label: "gray", code: "#6b7280" },
    { label: "red", code: "#ef4444" },
    { label: "orange", code: "#f97316" },
    { label: "amber", code: "#f59e0b" },
    { label: "yellow", code: "#d97706" },
    { label: "lime", code: "#84cc16" },
    { label: "green", code: "#22c55e" },
    { label: "emerald", code: "#10b981" },
    { label: "teal", code: "#14b8a6" },
    { label: "cyan", code: "#06b6d4" },
    { label: "sky", code: "#0ea5e9" },
    { label: "blue", code: "#3b82f6" },
    { label: "indigo", code: "#6366f1" },
    { label: "violet", code: "#8b5cf6" },
    { label: "purple", code: "#a855f7" },
    { label: "fuchsia", code: "#d946ef" },
    { label: "pink", code: "#ec4899" }
]
</script>

<template>
    <UPopover>
        <UButton icon="i-material-symbols-colors-rounded"></UButton>
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