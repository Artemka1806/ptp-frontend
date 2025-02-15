import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const user = ref({})

  const setUser = (newUser) => {
    user.value = newUser
  }

  const getUser = () => {
    return user.value
  }

  return { user, setUser, getUser }

})
