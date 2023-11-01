<script setup lang="ts">
const props = defineProps({
    dataset: Array
})

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'vue-chartjs'

ChartJS.register(ArcElement, Tooltip, Legend)

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
}

const filteredData = props.dataset?.filter((d: any) => d.value > 0) ?? []

const totalValue = filteredData.reduce((acc: number, d: any) => acc + d.value, 0)
const labelsWithPercentage = filteredData.map((d: any) => `${d.label} (${Math.round((d.value / totalValue) * 100)}%)`)

const chartData = {
    labels: labelsWithPercentage,
    datasets: [{ data: filteredData.map((d: any) => d.value), backgroundColor: filteredData.map((d: any) => d.color) }]
}
</script>


<template>
    <div>
        <Doughnut :data="chartData" :options="chartOptions" />
    </div>
</template>

<style lang="scss" scoped></style>