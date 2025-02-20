<template>
  <section class="auth-section">
    <h2>Вхід</h2>
    <form class="login-form" @submit.prevent="loginFunc">
      <mdui-text-field name="email" label="Email" type="email" required></mdui-text-field>
      <mdui-text-field name="password" label="Пароль" type="password" required></mdui-text-field>
      <mdui-button class="login-button" type="submit" style="margin-top: 10px; width: 100%">
        Увійти
      </mdui-button>
      <div
        id="g_id_onload"
        data-client_id="331151039682-3r1p3ce2fu77aepfs5439r1r23vbuu4c.apps.googleusercontent.com"
        data-context="use"
        data-ux_mode="popup"
        data-callback="handleGoogleAuth"
        data-auto_prompt="false"
      ></div>

      <div
        class="g_id_signin"
        data-type="standard"
        data-shape="pill"
        data-theme="filled_black"
        data-text="continue_with"
        data-size="large"
        data-logo_alignment="left"
      ></div>
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
export default {
  methods: {
    changeTab,
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
