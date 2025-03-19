<template>
  <div class="history-container" @touchstart="handleTouchStart" @touchend="handleTouchEnd">
    <PlantHeader
      v-if="plants.length > 0"
      :name="plants[currentPlantIndex]?.name"
      :current-index="currentPlantIndex"
      :total="plants.length"
      :show-navigation="showNavigation"
      @prev="prevPlant"
      @next="nextPlant"
    />

    <div class="content-section">
      <LoadingIndicator v-if="loading" />
      <div v-else>
        <div class="chart-section">
          <h2>Статистика за останні 7 днів</h2>
          <PlantStatsChart v-if="planHistoryArray.length > 0" :historyData="planHistoryArray" />
          <p v-else class="no-data">Дані історії відсутні</p>
        </div>

        <AiAdviceCard
          v-if="planHistoryArray.length > 0"
          :advice="weeklyAdvice"
          :loading="adviceLoading"
          :loaded="weeklyAdviceLoaded"
          :title="'Аналіз даних за тиждень'"
          :is-weekly="true"
          @info="showInfoAlert"
        />

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
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { getPlanHistoryById, getUserPlants, getPlantWeeklyAdviceById } from '@/http'
import PlantStatsChart from '@/components/PlantStatsChart.vue'
import 'mdui/components/card.js'
import 'mdui/components/button.js'
import '@mdui/icons/chevron-left.js'
import '@mdui/icons/chevron-right.js'
import { alert } from 'mdui/functions/alert.js'
import Typed from 'typed.js'
import PlantHeader from '@/components/PlantHeader.vue'
import AiAdviceCard from '@/components/AiAdviceCard.vue'
import LoadingIndicator from '@/components/LoadingIndicator.vue'

const userStore = useUserStore()
const planHistory = ref({})
const planHistoryArray = ref([])
const plants = ref([])
const currentPlantIndex = ref(0)
const loading = ref(true)
const adviceLoading = ref(false)
const weeklyAdvice = ref('')
const weeklyAdviceLoaded = ref(false)
const weeklyAdviceUpdatedAt = ref(null)
let typedInstance = null
const touchStartX = ref(0)
const touchEndX = ref(0)

// Computed property to determine if navigation arrows should be shown
const showNavigation = computed(() => plants.value.length > 1)

// Function to navigate to previous plant
const prevPlant = () => {
  if (plants.value.length <= 1) return

  currentPlantIndex.value =
    (currentPlantIndex.value - 1 + plants.value.length) % plants.value.length

  loadPlantData()
}

// Function to navigate to next plant
const nextPlant = () => {
  if (plants.value.length <= 1) return

  currentPlantIndex.value = (currentPlantIndex.value + 1) % plants.value.length

  loadPlantData()
}

// Touch event handlers for swipe functionality
const handleTouchStart = (event) => {
  touchStartX.value = event.changedTouches[0].screenX
}

const handleTouchEnd = (event) => {
  touchEndX.value = event.changedTouches[0].screenX
  handleGesture()
}

const handleGesture = () => {
  const threshold = 50 // Minimum distance to be considered a swipe
  if (touchEndX.value < touchStartX.value - threshold) {
    nextPlant() // Swipe left means go to next plant
  } else if (touchEndX.value > touchStartX.value + threshold) {
    prevPlant() // Swipe right means go to previous plant
  }
}

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

// Function to load weekly advice separately
const loadPlantAdvice = async (plantId) => {
  if (!plantId) return

  adviceLoading.value = true
  weeklyAdviceLoaded.value = false

  try {
    const weeklyAdviceResponse = await getPlantWeeklyAdviceById(plantId)
    weeklyAdvice.value = weeklyAdviceResponse.data.advice
    weeklyAdviceUpdatedAt.value = weeklyAdviceResponse.data.updated_at || new Date()
    weeklyAdviceLoaded.value = true
  } catch (adviceError) {
    console.error('Error fetching weekly advice:', adviceError)
  } finally {
    adviceLoading.value = false
  }
}

// Function to load data for current plant
const loadPlantData = async () => {
  try {
    const currentPlant = plants.value[currentPlantIndex.value]
    if (!currentPlant) return

    loading.value = true
    weeklyAdviceLoaded.value = false

    // Reset data
    planHistory.value = {}
    planHistoryArray.value = []

    // Update store with current plant
    userStore.setPlant(currentPlant)

    // Fetch history data for the current plant
    if (currentPlant.id) {
      const historyResponse = await getPlanHistoryById(currentPlant.id)
      planHistory.value = historyResponse.data

      planHistoryArray.value = Array.isArray(historyResponse.data)
        ? historyResponse.data
        : [historyResponse.data]

      // Now that basic data is loaded, set loading to false
      loading.value = false

      // Then load the advice separately
      loadPlantAdvice(currentPlant.id)
    } else {
      loading.value = false
    }
  } catch (error) {
    console.error('Error loading plant data:', error)
    loading.value = false
  }
}

onMounted(async () => {
  try {
    // Fetch all user plants
    const response = await getUserPlants()
    plants.value = response.data.plants || []

    // If we have plants, load data for the first one
    if (plants.value.length > 0) {
      loadPlantData()
    } else {
      loading.value = false
    }
  } catch (error) {
    console.error('Error fetching plants:', error)
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
        typeSpeed: 10, // Slowed down for better readability
        showCursor: false,
        loop: false,
      }

      typedInstance = new Typed('.weekly-advice-text', options)
    }, 100)
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
  display: flex;
  flex-direction: column;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.7);
}

.advice-loading {
  width: 100%;
  text-align: center;
  padding: 1rem 0;
  color: rgba(107, 33, 168, 0.7);
}

.advice-container {
  margin-bottom: 30px;
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

.content-section {
  position: relative;
  min-height: 200px; /* Adjust based on your needs */
}

/* Make sure PlantHeader stays fixed at the top */
.plant-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: rgb(var(--mdui-color-surface));
}
</style>
