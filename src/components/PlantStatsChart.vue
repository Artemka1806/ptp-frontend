<template>
  <div class="chart-container">
    <Line v-if="chartData.datasets.length > 0" :data="chartData" :options="chartOptions" />
    <div v-else></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

// Props
const props = defineProps({
  historyData: {
    type: Array,
    required: true,
  },
})

// Format date for display
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}`
}

// Prepare chart data
const chartData = computed(() => {
  if (!props.historyData || props.historyData.length === 0) {
    return { labels: [], datasets: [] }
  }

  // Sort data by date
  const sortedData = [...props.historyData].sort((a, b) => new Date(a.date) - new Date(b.date))

  // Extract labels (dates)
  const labels = sortedData.map((item) => formatDate(item.date))

  return {
    labels,
    datasets: [
      {
        label: 'Температура (°C)',
        backgroundColor: 'rgba(185, 28, 28, 0.1)',
        borderColor: '#b91c1c',
        data: sortedData.map((item) => parseFloat(item.statistics.temperature)),
        tension: 0.4,
      },
      {
        label: 'Вологість повітря (%)',
        backgroundColor: 'rgba(30, 64, 175, 0.1)',
        borderColor: '#1e40af',
        data: sortedData.map((item) => parseFloat(item.statistics.humidity)),
        tension: 0.4,
      },
      {
        label: 'Вологість ґрунту (%)',
        backgroundColor: 'rgba(21, 128, 61, 0.1)',
        borderColor: '#15803d',
        data: sortedData.map((item) => parseFloat(item.statistics.soil_moisture)),
        tension: 0.4,
      },
      {
        label: 'Рівень освітлення',
        backgroundColor: 'rgba(180, 83, 9, 0.1)',
        borderColor: '#b45309',
        data: sortedData.map((item) => parseFloat(item.statistics.light_level)),
        tension: 0.4,
      },
    ],
  }
})

// Chart options
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: false,
      grid: {
        color: 'rgba(255, 255, 255, 0.1)',
      },
      ticks: {
        color: '#fff',
        callback: (value) => `${value}`,
      },
    },
    x: {
      grid: {
        color: 'rgba(255, 255, 255, 0.1)',
      },
      ticks: {
        color: '#fff',
      },
    },
  },
  plugins: {
    tooltip: {
      backgroundColor: 'rgb(var(--mdui-color-surface-container))',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      callbacks: {
        labelColor: function (context) {
          const colors = {
            'Температура (°C)': '#b91c1c',
            'Вологість повітря (%)': '#1e40af',
            'Вологість ґрунту (%)': '#15803d',
            'Рівень освітлення': '#b45309',
          }
          return {
            borderColor: colors[context.dataset.label],
            backgroundColor: colors[context.dataset.label],
          }
        },
        label: function (context) {
          let label = context.dataset.label || ''
          if (label) {
            label += ': '
          }
          label += context.raw
          return label
        },
      },
    },
    legend: {
      position: 'top',
      labels: {
        color: '#fff',
        usePointStyle: true,
        pointStyle: 'circle',
      },
    },
  },
}
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 400px;
  width: 100%;
  padding: 20px;
}
</style>
