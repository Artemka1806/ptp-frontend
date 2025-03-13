<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import 'mdui/components/card.js'
import 'mdui/components/fab.js'
import { alert } from 'mdui/functions/alert.js'
import { exchange, deletePlantByCode, getPlantAdviceByCode } from '../http'
import '@mdui/icons/add.js'
import Typed from 'typed.js'
import router from '@/router'

const plants = ref([])
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
        const stat = data.plants[0].statistics
        statistics.value.name = data.plants[0].name
        statistics.value.code = data.plants[0].code
        statistics.value.temperature = Number(stat.temperature)
        statistics.value.humidity = Number(stat.humidity)
        statistics.value.soil_moisture = Number(stat.soil_moisture)
        statistics.value.light_level = Number(stat.light_level)

        adviceUpdatedAt.value = data.plants[0].advice_updated_at

        getPlantAdviceByCode(statistics.value.code)
          .then((response) => {
            advice.value = response.data.advice
            adviceLoaded.value = true
          })
          .catch((error) => {
            console.error('Error fetching advice:', error)
          })
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

const deletePlant = (code) => {
  deletePlantByCode(code)
    .then(() => {
      plants.value = []
      statistics.value = {
        name: '',
        code: '',
        temperature: 0,
        humidity: 0,
        soil_moisture: 0,
        light_level: 0,
      }
      fetchPlants()
    })
    .catch((error) => {
      console.error('Помилка видалення рослини:', error)
    })
}

watch(adviceLoaded, (newAdviceLoaded) => {
  if (newAdviceLoaded && advice.value) {
    if (typedInstance) {
      typedInstance.destroy()
    }

    setTimeout(() => {
      const options = {
        strings: [advice.value],
        typeSpeed: 10,
        showCursor: false,
        loop: false,
      }

      typedInstance = new Typed('.advice-text', options)
    }, 0)
  }
})

onMounted(() => {
  fetchPlants()
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
  <div class="plant-container" v-if="plants.length > 0">
    <div class="header-container">
      <div class="plant-header">
        <div class="plant-icon">
          <span>🌱</span>
        </div>
        <div class="plant-name">{{ statistics.name }}</div>
        <div class="plant-icon delete-icon" @click="deletePlant(statistics.code)">
          <span>🗑️</span>
        </div>
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
  padding: 40px 20px 30px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.plant-header {
  display: flex;
  align-items: center;
  max-width: 800px;
  width: 100%;
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
