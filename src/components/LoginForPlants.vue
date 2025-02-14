<script>
import 'mdui/components/card.js'
import { changeTab } from '@/utils'
export default {
  methods: {
    changeTab,
  },
}
import 'mdui/components/button.js'
import 'mdui/components/button.js'
</script>
<template>
  <mdui-card clickable class="login-card" @click="changeTab($router, 'login', 'profile')"
    ><span> Будь ласка, увійдіть, щоб переглянути рослини </span>
    <mdui-button
      class="login-button"
      @click="changeTab($router, 'login', 'profile')"
      style="margin-top: 10px; width: 100%"
      >Увійти</mdui-button
    >
  </mdui-card>
</template>
