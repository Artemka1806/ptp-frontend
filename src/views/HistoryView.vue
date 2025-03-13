<template>
  <div class="history-container">
    <div v-if="loading" class="loading">Завантаження...</div>
    <div v-else>
      <div class="chart-section">
        <h2>Статистика за весь час</h2>
        <PlantStatsChart :historyData="planHistoryArray" />
      </div>

      <div class="data-section">
        <h2>Необроблені дані</h2>
        <div class="table-container">
          <table v-if="planHistoryArray.length > 0" class="history-table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Температура (°C)</th>
                <th>Вологість повітря (%)</th>
                <th>Вологість ґрунту (%)</th>
                <th>Рівень освітлення</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="entry in planHistoryArray" :key="entry._id">
                <td>{{ formatDate(entry.date) }}</td>
                <td>{{ parseFloat(entry.statistics.temperature).toFixed(1) }}</td>
                <td>{{ parseFloat(entry.statistics.humidity).toFixed(1) }}</td>
                <td>{{ parseFloat(entry.statistics.soil_moisture).toFixed(1) }}</td>
                <td>{{ parseFloat(entry.statistics.light_level).toFixed(1) }}</td>
              </tr>
            </tbody>
          </table>
          <p v-else class="no-data">Дані історії відсутні</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { getPlanHistoryByCode, getUserPlants } from '@/http'
import PlantStatsChart from '@/components/PlantStatsChart.vue' // Import the chart component

const userStore = useUserStore()
const planHistory = ref({})
const planHistoryArray = ref([])
const plant = ref({})
const loading = ref(true)

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

.loading {
  text-align: center;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.7);
}

.chart-section,
.data-section {
  margin-bottom: 30px;
  border-radius: 12px;
  background-color: rgb(var(--mdui-color-surface-container));
}

h2 {
  color: #fff;
  margin-bottom: 20px;
  font-size: 1.5rem;
}

.table-container {
  overflow-x: auto;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
  background-color: rgb(var(--mdui-color-surface-container-high));
  border-radius: 8px;
  overflow: hidden;
}

.history-table th,
.history-table td {
  padding: 12px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.history-table th {
  background-color: rgba(120, 220, 119, 0.1);
  color: #78dc77;
  font-weight: 500;
}

.history-table td {
  color: rgba(255, 255, 255, 0.87);
}

.history-table tr:hover {
  background-color: rgba(120, 220, 119, 0.05);
}

.no-data {
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  padding: 2rem;
}
</style>
