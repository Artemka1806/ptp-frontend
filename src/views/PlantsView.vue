<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import 'mdui/components/card.js'
import 'mdui/components/fab.js'
import 'mdui/components/button.js'
import '@mdui/icons/chevron-left.js'
import '@mdui/icons/chevron-right.js'
import { confirm } from 'mdui/functions/confirm.js'
import { alert } from 'mdui/functions/alert.js'
import { exchange, deletePlantById, getPlantAdviceById } from '../http'
import '@mdui/icons/add.js'
import Typed from 'typed.js'
import router from '@/router'

const plants = ref([])
const currentPlantIndex = ref(0)
const statistics = ref({
  name: '',
  code: '',
  temperature: 0,
  humidity: 0,
  soil_moisture: 0,
  light_level: 0,
})
const advice = ref('')
const adviceLoaded = ref(false)
const adviceUpdatedAt = ref(null)
const touchStartX = ref(0)
const touchEndX = ref(0)

// Computed property to determine if navigation arrows should be shown
const showNavigation = computed(() => plants.value.length > 1)

// Add this function to show the alert with advice information
const showInfoAlert = () => {
  const updateDate = adviceUpdatedAt.value
    ? new Date(adviceUpdatedAt.value).toLocaleString('uk-UA', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Невідомо'

  alert({
    headline: 'Порада від ШІ',
    description: `Порада від ШІ оновлюється раз на добу для користувачів безкоштовного плану. Останнє оновлення: ${updateDate}`,
    confirmText: 'OK',
    onConfirm: () => {},
  })
}

// Function to navigate to previous plant
const prevPlant = () => {
  if (plants.value.length <= 1) return

  currentPlantIndex.value =
    (currentPlantIndex.value - 1 + plants.value.length) % plants.value.length

  updateCurrentPlantData()
}

// Function to navigate to next plant
const nextPlant = () => {
  if (plants.value.length <= 1) return

  currentPlantIndex.value = (currentPlantIndex.value + 1) % plants.value.length

  updateCurrentPlantData()
}

// Function to update displayed data based on current plant
const updateCurrentPlantData = (fetchAdvice = true) => {
  const plant = plants.value[currentPlantIndex.value]
  if (!plant) return

  const stat = plant.statistics || {
    temperature: 0,
    humidity: 0,
    soil_moisture: 0,
    light_level: 0,
  }

  statistics.value = {
    name: plant.name,
    code: plant.code,
    temperature: Number(stat.temperature),
    humidity: Number(stat.humidity),
    soil_moisture: Number(stat.soil_moisture),
    light_level: Number(stat.light_level),
  }

  adviceUpdatedAt.value = plant.advice_updated_at

  if (fetchAdvice) {
    adviceLoaded.value = false
    getPlantAdviceById(plant.id)
      .then((response) => {
        advice.value = response.data.advice
        adviceLoaded.value = true
      })
      .catch((error) => {
        console.error('Error fetching advice:', error)
      })
  }
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

let wsConnection = null
let typedInstance = null

const updateTokenAndReconnect = async () => {
  try {
    const exchangeData = await exchange()
    if (exchangeData.status === 200) {
      console.log('Token оновлено, повторно підключаємось до WebSocket...')
      if (wsConnection) {
        wsConnection.close()
      }
      fetchPlants()
    } else {
      localStorage.removeItem('token')
      console.error('Token exchange failed, please login again.')
    }
  } catch (error) {
    console.error('Token update failed:', error)
  }
}

const fetchPlants = () => {
  const token = localStorage.getItem('token')
  wsConnection = new WebSocket(import.meta.env.VITE_WS_API_URL + `/v1/user/plants?token=${token}`)

  wsConnection.onopen = () => {
    console.log("WebSocket-з'єднання встановлено")
  }

  wsConnection.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      if (data?.plants && data.plants.length > 0) {
        plants.value = data.plants

        // Make sure currentPlantIndex is valid
        if (currentPlantIndex.value >= plants.value.length) {
          currentPlantIndex.value = 0
        }

        updateCurrentPlantData(false)
      }
    } catch (error) {
      console.error('Помилка обробки даних з WebSocket:', error)
    }
  }

  wsConnection.onerror = (error) => {
    console.error('Помилка WebSocket:', error)
    updateTokenAndReconnect()
  }

  wsConnection.onclose = (event) => {
    console.log("WebSocket-з'єднання закрито:", event)
  }
}

const addPlant = () => {
  router.push('/add-plant')
}

const confirmDelete = (id) => {
  confirm({
    headline: 'Видалити рослину?',
    description: 'Ви впевнені, що хочете видалити цю рослину? Цю дію не можна скасувати.',
    cancelText: 'Скасувати',
    confirmText: 'Видалити',
    onCancel: () => {},
    onConfirm: () => {
      deletePlant(id)
    },
  })
}

const deletePlant = (id) => {
  deletePlantById(id)
    .then(() => {
      // If we're deleting the current plant
      plants.value = plants.value.filter((p) => p.id !== id)

      // Reset index if necessary
      if (plants.value.length === 0) {
        currentPlantIndex.value = 0
        statistics.value = {
          name: '',
          code: '',
          temperature: 0,
          humidity: 0,
          soil_moisture: 0,
          light_level: 0,
        }
        adviceLoaded.value = false
      } else if (currentPlantIndex.value >= plants.value.length) {
        currentPlantIndex.value = plants.value.length - 1
        updateCurrentPlantData()
      } else {
        updateCurrentPlantData()
      }
    })
    .catch((error) => {
      console.error('Помилка видалення рослини:', error)
    })
}

let loadadedAdvice = ref('')

watch(
  [adviceLoaded, () => plants.value[currentPlantIndex.value]?.id],
  ([newAdviceLoaded, plantId]) => {
    if (newAdviceLoaded && plantId) {
      // Completely destroy previous instance
      if (typedInstance) {
        typedInstance.destroy()
        typedInstance = null
      }

      // Clear the element content
      const adviceTextElement = document.querySelector('.advice-text')
      if (adviceTextElement) {
        adviceTextElement.innerHTML = ''
      }

      loadadedAdvice.value = advice.value

      // Small delay to ensure DOM is updated
      setTimeout(() => {
        const options = {
          strings: [advice.value || 'Немає поради'],
          typeSpeed: 10, // Try a slower speed to see the effect
          showCursor: false,
          loop: false,
        }

        // Create new typed instance
        typedInstance = new Typed('.advice-text', options)
      }, 50)
    }
  },
)

onMounted(() => {
  fetchPlants()
  setTimeout(() => {
    if (plants.value.length > 0) {
      const plant = plants.value[currentPlantIndex.value]
      if (plant) {
        adviceLoaded.value = false
        getPlantAdviceById(plant.id)
          .then((response) => {
            console.log('Initial advice:', response.data.advice)
            if (response.data.advice.trim() === '') {
              advice.value = 'Немає поради'
            } else {
              advice.value = response.data.advice
            }
            adviceLoaded.value = true
          })
          .catch((error) => {
            console.error('Error fetching initial advice:', error)
          })
      }
    }
  }, 1000)
})

onUnmounted(() => {
  if (wsConnection) {
    wsConnection.close()
  }

  if (typedInstance) {
    typedInstance.destroy()
  }
})
</script>

<template>
  <div
    class="plant-container"
    v-if="plants.length > 0"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
  >
    <div class="header-container">
      <div class="plant-navigation">
        <mdui-button v-if="showNavigation" @click="prevPlant">
          <mdui-icon-chevron-left></mdui-icon-chevron-left>
        </mdui-button>

        <div class="plant-header">
          <div class="plant-icon">
            <span>🌱</span>
          </div>
          <div class="plant-name">{{ statistics.name }}</div>
          <div class="plant-icon delete-icon" @click="confirmDelete(plants[currentPlantIndex].id)">
            <span>🗑️</span>
          </div>
        </div>

        <mdui-button v-if="showNavigation" @click="nextPlant">
          <mdui-icon-chevron-right></mdui-icon-chevron-right>
        </mdui-button>
      </div>

      <!-- Plant counter indicator -->
      <div class="plant-counter" v-if="showNavigation">
        {{ currentPlantIndex + 1 }} / {{ plants.length }}
      </div>
    </div>

    <div class="stats-container">
      <mdui-card class="stat-card temperature" outline>
        <div class="card-content">
          <div class="stat-value">
            <transition name="fade" mode="out-in">
              <span :key="statistics.temperature">{{ statistics.temperature }}°C</span>
            </transition>
          </div>
          <div class="stat-label">Температура</div>
        </div>
      </mdui-card>

      <mdui-card class="stat-card humidity" outline>
        <div class="card-content">
          <div class="stat-value">
            <transition name="fade" mode="out-in">
              <span :key="statistics.humidity">{{ statistics.humidity }}%</span>
            </transition>
          </div>
          <div class="stat-label">Вологість повітря</div>
        </div>
      </mdui-card>

      <mdui-card class="stat-card soil-moisture" outline>
        <div class="card-content">
          <div class="stat-value">
            <transition name="fade" mode="out-in">
              <span :key="statistics.soil_moisture">{{ statistics.soil_moisture }}%</span>
            </transition>
          </div>
          <div class="stat-label">Вологість ґрунту</div>
        </div>
      </mdui-card>

      <mdui-card class="stat-card light-level" outline>
        <div class="card-content">
          <div class="stat-value">
            <transition name="fade" mode="out-in">
              <span :key="statistics.light_level">{{ statistics.light_level }} lx</span>
            </transition>
          </div>
          <div class="stat-label">Рівень світла</div>
        </div>
      </mdui-card>
    </div>

    <!-- Modified AI Advice Block -->
    <div class="advice-container" v-if="adviceLoaded">
      <!-- Add v-if here -->
      <mdui-card class="advice-card" outline>
        <div class="card-content advice-content">
          <div class="advice-header">
            <div class="advice-icon">🤖</div>
            <div class="advice-title">Порада від ШІ</div>
            <div class="info-icon" @click="showInfoAlert">ℹ️</div>
          </div>
          <div class="advice-text"></div>
          <!-- Display the advice -->
        </div>
      </mdui-card>
    </div>
  </div>
  <div class="no-plants" v-else>
    <mdui-card class="card"><span>У Вас немає рослин</span></mdui-card>
    <mdui-fab size="large" class="button" @click="addPlant"
      ><mdui-icon-add slot="icon"></mdui-icon-add
    ></mdui-fab>
  </div>
</template>

<style>
.no-plants {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.no-plants .card {
  display: flex;
  margin: auto;
  margin-top: 20px;
  padding: 20px;
  text-align: center;
  font-size: 20px;
  background-color: #f0fbf0;
  color: #15803d;
  border: 1px solid rgba(21, 128, 61, 0.15);
  width: 80%;
}

.no-plants .button {
  margin-top: 200px;
}

.header-container {
  padding: 40px 20px 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.plant-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 800px;
}

.plant-counter {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 5px;
}

.plant-header {
  display: flex;
  align-items: center;
  flex-grow: 1;
  justify-content: center;
}

.plant-icon {
  width: 46px;
  height: 46px;
  background-color: rgb(var(--mdui-color-surface-container-high-dark));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  font-size: 24px;
}

.delete-icon {
  margin-left: auto;
  cursor: pointer;
}

.plant-name {
  font-size: 36px;
  font-weight: 600;
  color: #ffffff;
  letter-spacing: 0.5px;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  margin-top: -15px;
}

.stat-card {
  border-radius: 12px;
  overflow: hidden;
  transition: box-shadow 0.2s ease;
}

.stat-card:hover {
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.card-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100px;
}

.temperature {
  background-color: #fff5f5;
  color: #b91c1c;
  border: 1px solid rgba(185, 28, 28, 0.15);
}

.humidity {
  background-color: #f0f7ff;
  color: #1e40af;
  border: 1px solid rgba(30, 64, 175, 0.15);
}

.soil-moisture {
  background-color: #f0fbf0;
  color: #15803d;
  border: 1px solid rgba(21, 128, 61, 0.15);
}

.light-level {
  background-color: #fffbeb;
  color: #b45309;
  border: 1px solid rgba(180, 83, 9, 0.15);
}

.stat-value {
  font-size: 24px;
  font-weight: 500;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.85;
}

.advice-container {
  padding: 0 20px 20px;
  max-width: 800px;
  margin: 0 auto;
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

.advice-card {
  border-radius: 12px;
  overflow: hidden;
  transition: box-shadow 0.2s ease;
  background-color: #f3e8ff;
  color: #6b21a8;
  min-width: 50%;
  border: 1px solid rgba(107, 33, 168, 0.15);
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

.advice-text {
  width: 100%;
  font-size: 16px;
  opacity: 0.9;
  padding-top: 4px;
  white-space: pre-line;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
