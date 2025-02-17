<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { getUserPlants } from '@/http'
import 'mdui/components/card.js'
import usePwaInstall from '@/pwa-install'

const plants = ref([])
const statistics = ref({
  name: '',
  temperature: 0,
  humidity: 0,
  soil_moisture: 0,
  light_level: 0,
})

const fetchPlants = async () => {
  try {
    const response = await getUserPlants()
    if (response?.data?.plants?.length > 0) {
      plants.value = response.data.plants
      const stat = response.data.plants[0].statistics
      statistics.value.name = response.data.plants[0].name
      statistics.value.temperature = Number(stat.temperature)
      statistics.value.humidity = Number(stat.humidity)
      statistics.value.soil_moisture = Number(stat.soil_moisture)
      statistics.value.light_level = Number(stat.light_level)
    }
  } catch (error) {
    console.error(error)
  }
}

let intervalId = null

onMounted(() => {
  fetchPlants()
  intervalId = setInterval(fetchPlants, 20000)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})

// Get the prompt function from the PWA install module.
const promptPwaInstall = usePwaInstall()

// Call this function based on a user interaction.
const installPwa = async () => {
  await promptPwaInstall()
}
</script>

<template>
  <div class="header-container">
    <div class="plant-header">
      <div class="plant-icon">
        <span>🌱</span>
      </div>
      <div class="plant-name">{{ statistics.name }}</div>
    </div>
  </div>

  <div class="stats-container">
    <mdui-card class="stat-card temperature" outline>
      <div class="card-content">
        <div class="stat-value">{{ statistics.temperature }}°C</div>
        <div class="stat-label">Температура</div>
      </div>
    </mdui-card>

    <mdui-card class="stat-card humidity" outline>
      <div class="card-content">
        <div class="stat-value">{{ statistics.humidity }}%</div>
        <div class="stat-label">Вологість повітря</div>
      </div>
    </mdui-card>

    <mdui-card class="stat-card soil-moisture" outline>
      <div class="card-content">
        <div class="stat-value">{{ statistics.soil_moisture }}%</div>
        <div class="stat-label">Вологість ґрунту</div>
      </div>
    </mdui-card>

    <mdui-card class="stat-card light-level" outline>
      <div class="card-content">
        <div class="stat-value">{{ statistics.light_level }} lx</div>
        <div class="stat-label">Рівень світла</div>
      </div>
    </mdui-card>
  </div>

  <!-- A button to trigger the PWA installation prompt -->
  <div style="text-align: center; margin-top: 20px">
    <button @click="installPwa">Install App</button>
  </div>
</template>

<style>
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
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  font-size: 24px;
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
</style>
