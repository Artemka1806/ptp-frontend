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

  const logout = () => {
    user.value = {}
    localStorage.removeItem('token')
    document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    window.location.href = '/login'
  }

  return { user, setUser, getUser, logout }

})
