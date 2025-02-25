import { defineStore } from 'pinia'
import { reactive } from 'vue'
import router from '@/router'
import { logout as logoutApi } from '@/http'
import { getUserPlants } from '@/http'

export const useUserStore = defineStore('user', () => {
  const user = reactive({})
  const plant = reactive({})

  const setUser = async (newUser) => {
    Object.assign(user, newUser)
    try {
      const { data } = await getUserPlants()
      if (data.plants.length > 0) {
        setPlant(data.plants[0])
      }
    } catch (error) {
      console.error('Error fetching plants:', error)
    }
  }

  const getUser = () => {
    return user
  }

  const getPlant = () => {
    return plant
  }

  const setPlant = (newPlant) => {
    Object.assign(plant, newPlant)
  }

  const logout = async () => {
    try {
      await logoutApi()
      Object.keys(user).forEach(key => delete user[key])
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      Object.keys(user).forEach(key => delete user[key])
      router.push('/login')
    }
  }

  return { user, setUser, getUser, logout, plant, setPlant, getPlant }

})
