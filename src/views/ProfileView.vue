<template>Name: {{ userStore.user.name }} Email: {{ userStore.user.email }}</template>
<script setup>
import { useUserStore } from '@/stores/user'
import { getMe } from '@/http'

const userStore = useUserStore()

const getUser = async () => {
  try {
    const response = await getMe()
    if (response && response.data) {
      userStore.setUser(response.data)
    }
    return response
  } catch (error) {
    console.error(error)
  }
}

let u = getUser()
</script>
