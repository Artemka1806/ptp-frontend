<script setup>
import { ref } from 'vue'
import { getUserPlants } from '@/http'

const plants = ref([])

const fetchPlants = async () => {
  try {
    const response = await getUserPlants()
    if (response && response.data) {
      plants.value = response.data.plants
    }
  } catch (error) {
    console.error(error)
  }
}

fetchPlants()
</script>
<template>
  {{ plants }}
</template>
