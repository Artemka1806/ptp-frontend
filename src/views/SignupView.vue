<template>
  <section class="auth-section">
    <h2>Реєстрація</h2>
    <form class="signup-form" @submit.prevent="signupFunc">
      <mdui-text-field name="name" label="Ім'я" required></mdui-text-field>
      <mdui-text-field name="email" label="Email" type="email" required></mdui-text-field>
      <mdui-radio-group name="sex" value="male">
        <mdui-radio value="male">Чоловік</mdui-radio>
        <mdui-radio value="female">Жінка</mdui-radio>
      </mdui-radio-group>
      <mdui-text-field
        name="yearOfBirth"
        label="Рік народження"
        type="number"
        :min="1900"
        :max="new Date().getFullYear()"
        required
      ></mdui-text-field>
      <mdui-text-field name="password" label="Пароль" type="password" required></mdui-text-field>
      <mdui-text-field
        name="confirmPassword"
        label="Підтвердити пароль"
        type="password"
        required
      ></mdui-text-field>
      <mdui-button
        class="signup-button"
        type="submit"
        name="signup"
        value="signup-value"
        style="margin-top: 10px; width: 100%"
      >
        Зареєструватися
      </mdui-button>
      <span style="user-select: none; text-align: center; margin: auto; margin-top: 10px">
        Уже є акаунт?
        <span
          style="color: rgb(var(--mdui-color-primary)); cursor: pointer"
          @click="changeTab($router, 'login', 'profile')"
        >
          Увійти
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
import 'mdui/components/radio-group.js'
import 'mdui/components/radio.js'
import router from '@/router'
import { signup, getMe } from '@/http'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const signupFunc = async (event) => {
  event.preventDefault()

  const form = event.target
  const formData = new FormData(form)
  const name = formData.get('name')
  const email = formData.get('email')
  const sex = formData.get('sex')
  const yearOfBirth = parseInt(formData.get('yearOfBirth'))
  const password = formData.get('password')
  const confirmPassword = formData.get('confirmPassword')

  if (password !== confirmPassword) {
    alert('Паролі не співпадають')
    return
  }

  const currentYear = new Date().getFullYear()
  if (yearOfBirth < 1900 || yearOfBirth > currentYear) {
    alert(`Рік народження має бути між 1900 та ${currentYear}`)
    return
  }

  const payload = {
    name,
    email,
    sex,
    year_of_birth: yearOfBirth,
    password,
  }

  try {
    const response = await signup(payload)
    if (response && response.data) {
      const userResponse = await getMe()
      if (userResponse && userResponse.data) {
        userStore.setUser(userResponse.data)
        router.push({ name: 'profile' })
      } else {
        alert('Не вдалося отримати дані користувача')
      }
    } else {
      alert('Ця пошта уже використовується')
    }
  } catch (error) {
    console.error(error)
    alert('Помилка сервера')
  }
}
</script>
