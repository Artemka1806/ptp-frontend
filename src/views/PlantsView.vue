<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
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
import PlantHeader from '@/components/PlantHeader.vue'
import AiAdviceCard from '@/components/AiAdviceCard.vue'
import LoadingIndicator from '@/components/LoadingIndicator.vue'
import StatCard from '@/components/StatCard.vue'

const plants = ref([])
const currentPlantIndex = ref(0)
const loading = ref(true)
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
  loading.value = true
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
      loading.value = false
    } catch (error) {
      console.error('Помилка обробки даних з WebSocket:', error)
      loading.value = false
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
  <LoadingIndicator v-if="loading" />
  <div
    v-else-if="plants.length > 0"
    class="plant-container"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
  >
    <PlantHeader
      :name="statistics.name"
      :current-index="currentPlantIndex"
      :total="plants.length"
      :show-navigation="showNavigation"
      :show-delete="true"
      @prev="prevPlant"
      @next="nextPlant"
      @delete="confirmDelete(plants[currentPlantIndex].id)"
    />

    <div class="stats-container">
      <StatCard type="temperature" :value="statistics.temperature" label="Температура" unit="°C" />

      <StatCard type="humidity" :value="statistics.humidity" label="Вологість повітря" unit="%" />

      <StatCard
        type="soil-moisture"
        :value="statistics.soil_moisture"
        label="Вологість ґрунту"
        unit="%"
      />

      <StatCard
        type="light-level"
        :value="statistics.light_level"
        label="Рівень світла"
        unit=" lx"
      />
    </div>

    <AiAdviceCard
      v-if="adviceLoaded"
      :advice="advice"
      :loaded="adviceLoaded"
      @info="showInfoAlert"
    />
  </div>
  <div class="no-plants" v-else>
    <LoadingIndicator text="У Вас немає рослин" />
    <mdui-fab size="large" class="button" @click="addPlant">
      <mdui-icon-add slot="icon"></mdui-icon-add>
    </mdui-fab>
  </div>
</template>

<style>
.advice-card {
  margin: 0 20px;
}

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

.stats-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  margin-top: -15px;
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
