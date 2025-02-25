<template>
  <div class="chart-container">
    <Line v-if="chartData.datasets.length > 0" :data="chartData" :options="chartOptions" />
    <div v-else>No data available</div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
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
  return `${date.getMonth() + 1}/${date.getDate()}`
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
        label: 'Temperature (°C)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        data: sortedData.map((item) => parseFloat(item.statistics.temperature)),
        tension: 0.4,
      },
      {
        label: 'Humidity (%)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        data: sortedData.map((item) => parseFloat(item.statistics.humidity)),
        tension: 0.4,
      },
      {
        label: 'Soil Moisture (%)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        data: sortedData.map((item) => parseFloat(item.statistics.soil_moisture)),
        tension: 0.4,
      },
      {
        label: 'Light Level',
        backgroundColor: 'rgba(255, 206, 86, 0.2)',
        borderColor: 'rgba(255, 206, 86, 1)',
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
      ticks: {
        callback: (value) => `${value}`,
      },
    },
  },
  plugins: {
    tooltip: {
      callbacks: {
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
    },
  },
}
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 400px;
  width: 100%;
}
</style>
