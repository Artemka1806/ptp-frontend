<script setup>
import 'mdui/mdui.css'
import FooterComponent from './components/FooterComponent.vue'
import { RouterView } from 'vue-router'
import { setColorScheme } from 'mdui/functions/setColorScheme.js'
import 'mdui/components/button.js'
import '@khmyznikov/pwa-install'
import { useUserStore } from './stores/user'
import { getMe, subscribeToNotifications } from '@/http'
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

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/notifications-worker.js')
    .then((registration) => {
      console.log('Service Worker зареєстровано', registration)
    })
    .catch((error) => {
      console.error('Service Worker не зареєстровано', error)
    })
}

function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

// Subscribe to push notifications
navigator.serviceWorker.ready.then((registration) => {
  const vapidPublicKey = import.meta.env.VITE_WEBPUSH_PUBLIC_KEY
  const convertedKey = urlB64ToUint8Array(vapidPublicKey)
  registration.pushManager
    .subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedKey,
    })
    .then((subscription) => {
      subscribeToNotifications(subscription)
        .then(() => console.log('Subscription sent to the backend successfully'))
        .catch((err) => console.error('Failed to send subscription to the backend', err))
    })
    .catch((err) => console.error('Failed to subscribe to push notifications', err))
})
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
