<script setup lang="ts">
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'vue-chartjs'

ChartJS.register(ArcElement, Tooltip, Legend)

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
}

const chartData = {
    labels: ['SBM', 'VyV', 'March'],
    datasets: [{ data: [40, 20, 12] }]
}
</script>

<template>
    <div>
        <Doughnut :data="chartData" :options="chartOptions" />
    </div>
</template>

<style lang="scss" scoped></style>