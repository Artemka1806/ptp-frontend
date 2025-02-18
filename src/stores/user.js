import { defineStore } from 'pinia'
import { reactive } from 'vue'

export const useUserStore = defineStore('user', () => {
  const user = reactive({})

  const setUser = (newUser) => {
    Object.assign(user, newUser)
  }

  const getUser = () => {
    return user
  }

  const logout = () => {
    localStorage.removeItem('token')
    document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    window.location.href = '/login'
    Object.keys(user).forEach(key => delete user[key])
    console.log(user)
  }

  return { user, setUser, getUser, logout }

})
