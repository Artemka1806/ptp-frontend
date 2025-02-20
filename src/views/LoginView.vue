<template>
  <section class="auth-section">
    <h2>Вхід</h2>
    <form class="login-form" @submit.prevent="loginFunc">
      <mdui-text-field name="email" label="Email" type="email" required></mdui-text-field>
      <mdui-text-field name="password" label="Пароль" type="password" required></mdui-text-field>
      <mdui-button class="login-button" type="submit" style="margin-top: 10px; width: 100%">
        Увійти
      </mdui-button>
      <span style="user-select: none; text-align: center; margin: auto; margin-top: 10px">
        Ще немає акаунта?
        <span
          style="color: rgb(var(--mdui-color-primary)); cursor: pointer"
          @click="changeTab($router, 'signup', 'profile')"
        >
          Зареєструватися
        </span>
      </span>
    </form>
  </section>
</template>

<script>
import { changeTab } from '@/utils'
import { handleGoogleAuth } from '@/auth'
export default {
  methods: {
    changeTab,
    handleGoogleAuth,
  },
}
</script>

<script setup>
import 'mdui/components/text-field.js'
import 'mdui/components/button.js'
import { useUserStore } from '@/stores/user'
import router from '@/router'
import { login, getMe } from '@/http'

const userStore = useUserStore()

const loginFunc = async (event) => {
  event.preventDefault()
  const form = event.target
  const formData = new FormData(form)
  const email = formData.get('email')
  const password = formData.get('password')
  const payload = { email, password }

  try {
    const response = await login(payload)
    if (response && response.data) {
      const userResponse = await getMe()
      if (userResponse && userResponse.data) {
        userStore.setUser(userResponse.data)
      } else {
        alert('Не вдалося отримати дані користувача')
        return
      }
      router.push({ name: 'profile' })
    } else {
      alert('Невірний email або пароль')
    }
  } catch (error) {
    console.error(error)
    alert('Помилка сервера')
  }
}
</script>
