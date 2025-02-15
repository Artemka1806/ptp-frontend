<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { getUserPlants } from '@/http'
import 'mdui/components/card.js'

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
</script>

<template>
  <h2 class="plant-title">{{ statistics.name }}</h2>
  <div class="stats-container">
    <mdui-card class="stat-card temperature">
      <div class="stat-value">{{ statistics.temperature }}°C</div>
      <div class="stat-label">Temperature</div>
    </mdui-card>

    <mdui-card class="stat-card humidity">
      <div class="stat-value">{{ statistics.humidity }}%</div>
      <div class="stat-label">Humidity</div>
    </mdui-card>

    <mdui-card class="stat-card soil-moisture">
      <div class="stat-value">{{ statistics.soil_moisture }}%</div>
      <div class="stat-label">Soil Moisture</div>
    </mdui-card>

    <mdui-card class="stat-card light-level">
      <div class="stat-value">{{ statistics.light_level }} lx</div>
      <div class="stat-label">Light Level</div>
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

.plant-title {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}

.stat-card {
  padding: 20px;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  border-radius: 10px;
  color: white;
}

.temperature {
  background-color: #ff6b6b;
}
.humidity {
  background-color: #4dabf7;
}
.soil-moisture {
  background-color: #51cf66;
}
.light-level {
  background-color: #f59f00;
}

.stat-value {
  font-size: 24px;
}

.stat-label {
  margin-top: 8px;
  font-size: 16px;
  text-transform: capitalize;
}
</style>
