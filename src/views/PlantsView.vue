<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { getUserPlants } from '@/http'
import RadialProgress from 'vue3-radial-progress'

import 'mdui/components/card.js'

// Remove or keep plants if needed for other purposes
const plants = ref([])

// New reactive object for statistics
const statistics = ref({
  temperature: 0,
  humidity: 0,
  soil_moisture: 0,
  light_level: 0,
})

const fetchPlants = async () => {
  try {
    const response = await getUserPlants()
    if (response && response.data) {
      if (response.data.plants) {
        plants.value = response.data.plants
        // Якщо є хоча б одна рослина і в ній є статистика
        if (response.data.plants.length > 0 && response.data.plants[0].statistics) {
          const stat = response.data.plants[0].statistics
          statistics.value.temperature = Number(stat.temperature)
          statistics.value.humidity = Number(stat.humidity)
          statistics.value.soil_moisture = Number(stat.soil_moisture)
          statistics.value.light_level = Number(stat.light_level)
        }
      }
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
</script>

<template>
  <div>
    <mdui-card class="mdui-shadow-2 mdui-margin plant-card">
      <div class="mdui-card-content stats-container">
        <div class="stat-item">
          <RadialProgress
            class="radial-progress"
            :diameter="120"
            :completed-steps="parseFloat(statistics.temperature)"
            :total-steps="100"
            :stroke-width="10"
          >
            <div class="stat-value">{{ statistics.temperature }}</div>
          </RadialProgress>
          <div class="stat-label mdui-typography-subheading">Temperature</div>
        </div>
        <div class="stat-item">
          <RadialProgress
            :diameter="120"
            :completed-steps="parseFloat(statistics.humidity)"
            :total-steps="100"
            :stroke-width="10"
          >
            <div class="stat-value">{{ statistics.humidity }}</div>
          </RadialProgress>
          <div class="stat-label mdui-typography-subheading">Humidity</div>
        </div>
        <div class="stat-item">
          <RadialProgress
            :diameter="120"
            :completed-steps="parseFloat(statistics.soil_moisture)"
            :total-steps="100"
            :stroke-width="10"
          >
            <div class="stat-value">{{ statistics.soil_moisture }}</div>
          </RadialProgress>
          <div class="stat-label mdui-typography-subheading">Soil Moisture</div>
        </div>
        <div class="stat-item">
          <RadialProgress
            :diameter="120"
            :completed-steps="parseFloat(statistics.light_level)"
            :total-steps="100"
            :stroke-width="10"
          >
            <div class="stat-value">{{ statistics.light_level }}</div>
          </RadialProgress>
          <div class="stat-label mdui-typography-subheading">Light Level</div>
        </div>
      </div>
    </mdui-card>
  </div>
</template>

<style>
.stats-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  padding: 20px;
  justify-content: center;
  margin: auto;
}

.plant-card {
  margin: auto;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 150px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
}

.stat-label {
  margin-top: 8px;
  font-size: 16px;
  font-weight: bold;
  text-transform: capitalize;
}
</style>
