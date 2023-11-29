<script setup lang="ts">
const props = defineProps({
    dataset: {
        type: Array,
        required: true
    }
})

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'vue-chartjs'

ChartJS.register(ArcElement, Tooltip, Legend)

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
}

const chartData = computed(() => {
    return {
        labels: props.dataset.filter((d: any) => d.value > 0).map((d: any) => `${d.label} (${Math.round((d.value / props.dataset.reduce((acc: number, d: any) => acc + d.value, 0)) * 100)}%)`),
        datasets: [
            {
                data: props.dataset.filter((d: any) => d.value > 0),
                backgroundColor: props.dataset.filter((d: any) => d.value > 0).map((d: any) => d.color),
                borderWidth: 1
            }
        ]
    }
})
</script>

<template>
    <div>
        <Doughnut :data="chartData" :options="chartOptions" />
    </div>
</template>

<style lang="scss" scoped></style>