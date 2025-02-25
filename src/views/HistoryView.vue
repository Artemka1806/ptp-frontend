<template>
  <div>
    <div v-if="loading">Loading...</div>
    <div v-else>
      <h1>History</h1>
      <p>{{ planHistory }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { getPlanHistoryByCode, getUserPlants } from '@/http'

const userStore = useUserStore()
const planHistory = ref({})
const plant = ref({})
const loading = ref(true)

onMounted(async () => {
  try {
    const response = await getUserPlants()
    if (response.data.plants.length > 0) {
      plant.value = response.data.plants[0]
      userStore.setPlant(plant.value)

      if (plant.value.code) {
        const historyResponse = await getPlanHistoryByCode(plant.value.code)
        planHistory.value = historyResponse.data
      }
    }
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    loading.value = false
  }
})
</script>
