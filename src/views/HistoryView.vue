<template>
  <div>
    <div v-if="loading">Loading...</div>
    <div v-else class="history-container">
      <h1>Plant History</h1>

      <div class="chart-section">
        <h2>Statistics Over Time</h2>
        <PlantStatsChart :historyData="planHistoryArray" />
      </div>

      <div class="data-section">
        <h2>Raw Data</h2>
        <table v-if="planHistoryArray.length > 0" class="history-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Temperature (°C)</th>
              <th>Humidity (%)</th>
              <th>Soil Moisture (%)</th>
              <th>Light Level</th>
              <th>Updates</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="entry in planHistoryArray" :key="entry._id">
              <td>{{ formatDate(entry.date) }}</td>
              <td>{{ parseFloat(entry.statistics.temperature).toFixed(1) }}</td>
              <td>{{ parseFloat(entry.statistics.humidity).toFixed(1) }}</td>
              <td>{{ parseFloat(entry.statistics.soil_moisture).toFixed(1) }}</td>
              <td>{{ parseFloat(entry.statistics.light_level).toFixed(1) }}</td>
              <td>{{ entry.update_count }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else>No history data available</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { getPlanHistoryByCode, getUserPlants } from '@/http'
import PlantStatsChart from '@/components/PlantStatsChart.vue' // Import the chart component

const userStore = useUserStore()
const planHistory = ref({})
const planHistoryArray = ref([])
const plant = ref({})
const loading = ref(true)

// Format date for display
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

onMounted(async () => {
  try {
    const response = await getUserPlants()
    if (response.data.plants.length > 0) {
      plant.value = response.data.plants[0]
      userStore.setPlant(plant.value)

      if (plant.value.code) {
        const historyResponse = await getPlanHistoryByCode(plant.value.code)
        planHistory.value = historyResponse.data

        // Convert to array if it's not already
        planHistoryArray.value = Array.isArray(historyResponse.data)
          ? historyResponse.data
          : [historyResponse.data]
      }
    }
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.history-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.chart-section,
.data-section {
  margin-bottom: 30px;
  padding: 15px;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}

.history-table th,
.history-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}

.history-table th {
  background-color: #f2f2f2;
  font-weight: bold;
}

.history-table tr:nth-child(even) {
  background-color: #f9f9f9;
}

.history-table tr:hover {
  background-color: #f1f1f1;
}
</style>
