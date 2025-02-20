<script setup>
import 'mdui/mdui.css'
import FooterComponent from './components/FooterComponent.vue'
import { RouterView } from 'vue-router'
import { setColorScheme } from 'mdui/functions/setColorScheme.js'
import 'mdui/components/button.js'
import '@khmyznikov/pwa-install'
import { useUserStore } from './stores/user'
import { getMe } from '@/http'
import { computed } from 'vue'

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

getUser()

setColorScheme('#78dc77')

const isUserLoggedIn = computed(() => !!userStore.user.email)
</script>

<template>
  <main>
    <RouterView />
  </main>
  <FooterComponent v-if="isUserLoggedIn" />
  <pwa-install
    install-description="Встановіть веб-додаток для доступу до повного функціоналу"
    disable-install-description="true"
    disable-screenshots="true"
    manifest-url="/manifest.json"
    name="Pet The Plant"
    description="Pet The Plant - Making plant care smarter 🪴"
    icon="/icons/icon-128x128.png"
  >
  </pwa-install>
</template>
