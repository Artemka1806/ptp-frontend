<template>
  <div class="history-container">
    <div v-if="loading" class="loading">Завантаження...</div>
    <div v-else>
      <div class="chart-section">
        <h2>Статистика за останні 7 днів</h2>
        <PlantStatsChart v-if="planHistoryArray.length > 0" :historyData="planHistoryArray" />
        <p v-else class="no-data">Дані історії відсутні</p>
      </div>

      <mdui-card
        v-if="weeklyAdviceLoaded && planHistoryArray.length > 0"
        class="advice-card"
        outline
      >
        <div class="card-content advice-content">
          <div class="advice-header">
            <div class="advice-icon">🤖</div>
            <div class="advice-title">Аналіз даних за тиждень</div>
            <div class="info-icon" @click="showInfoAlert">ℹ️</div>
          </div>
          <div class="weekly-advice-text"></div>
        </div>
      </mdui-card>

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
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import { getPlanHistoryByCode, getUserPlants, getPlantWeeklyAdviceById } from '@/http'
import PlantStatsChart from '@/components/PlantStatsChart.vue'
import 'mdui/components/card.js'
import { alert } from 'mdui/functions/alert.js'
import Typed from 'typed.js'

const userStore = useUserStore()
const planHistory = ref({})
const planHistoryArray = ref([])
const plant = ref({})
const loading = ref(true)
const weeklyAdvice = ref('')
const weeklyAdviceLoaded = ref(false)
const weeklyAdviceUpdatedAt = ref(null)
let typedInstance = null

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

const showInfoAlert = () => {
  const updateDate = weeklyAdviceUpdatedAt.value
    ? new Date(weeklyAdviceUpdatedAt.value).toLocaleString('uk-UA', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Невідомо'

  alert({
    headline: 'Аналіз даних за тиждень',
    description: `Аналіз від ШІ базується на даних за останні 7 днів. Останнє оновлення: ${updateDate}`,
    confirmText: 'OK',
    onConfirm: () => {},
  })
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

        planHistoryArray.value = Array.isArray(historyResponse.data)
          ? historyResponse.data
          : [historyResponse.data]
        console.log(planHistoryArray.value)

        try {
          const weeklyAdviceResponse = await getPlantWeeklyAdviceById(plant.value.id)
          weeklyAdvice.value = weeklyAdviceResponse.data.advice
          weeklyAdviceUpdatedAt.value = weeklyAdviceResponse.data.updated_at || new Date()
          weeklyAdviceLoaded.value = true
        } catch (adviceError) {
          console.error('Error fetching weekly advice:', adviceError)
        }
      }
    }
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    loading.value = false
  }
})

watch(weeklyAdviceLoaded, (newAdviceLoaded) => {
  if (newAdviceLoaded && weeklyAdvice.value) {
    if (typedInstance) {
      typedInstance.destroy()
    }

    setTimeout(() => {
      const options = {
        strings: [weeklyAdvice.value],
        typeSpeed: -100,
        showCursor: false,
        loop: false,
      }

      typedInstance = new Typed('.weekly-advice-text', options)
    }, 0)
  }
})

onUnmounted(() => {
  if (typedInstance) {
    typedInstance.destroy()
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
  padding: 5px 20px;
  border-radius: 12px;
  background-color: rgb(var(--mdui-color-surface-container));
}

.chart-container {
  padding-left: 0px;
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

.advice-card {
  border-radius: 12px;
  overflow: hidden;
  transition: box-shadow 0.2s ease;
  background-color: #f3e8ff;
  color: #6b21a8;
  border: 1px solid rgba(107, 33, 168, 0.15);
  margin-bottom: 30px;
}

.advice-card:hover {
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.advice-content {
  align-items: flex-start;
  padding: 16px 20px;
}

.advice-header {
  display: flex;
  align-items: center;
  align-self: flex-start;
  margin-bottom: 14px;
  width: 100%;
}

.advice-icon {
  font-size: 18px;
  margin-right: 8px;
}

.advice-title {
  font-size: 16px;
  font-weight: 500;
}

.info-icon {
  font-size: 14px;
  margin-left: auto;
  cursor: pointer;
  background-color: rgba(107, 33, 168, 0.1);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
  position: relative;
  top: -2px;
  padding-bottom: 0.7px;
}

.info-icon:hover {
  background-color: rgba(107, 33, 168, 0.2);
}

.weekly-advice-text {
  width: 100%;
  font-size: 16px;
  opacity: 0.9;
  padding-top: 4px;
  white-space: pre-line;
}
</style>
