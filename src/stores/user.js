import { defineStore } from 'pinia'
import { reactive } from 'vue'
import router from '@/router'
import { logout as logoutApi } from '@/http'

export const useUserStore = defineStore('user', () => {
  const user = reactive({})

  const setUser = (newUser) => {
    Object.assign(user, newUser)
  }

  const getUser = () => {
    return user
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

  return { user, setUser, getUser, logout }

})
