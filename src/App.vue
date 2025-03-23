<script setup>
import 'mdui/mdui.css'
import FooterComponent from './components/FooterComponent.vue'
import { RouterView } from 'vue-router'
import { setColorScheme } from 'mdui/functions/setColorScheme.js'
import 'mdui/components/button.js'
import '@khmyznikov/pwa-install'
import { useUserStore } from './stores/user'
import { getMe, subscribeToNotifications, syncOfflineRequests } from '@/http'
import { computed, ref, onMounted } from 'vue'
import { offlineStorage } from './utils/offlineStorage'

const userStore = useUserStore()
const isOffline = ref(false)

const getUser = async () => {
  try {
    const response = await getMe()
    if (response && response.data) {
      userStore.setUser(response.data)
      // Також зберігаємо базові дані користувача локально для офлайн режиму
      offlineStorage.saveData('user', response.data)
    }
    return response
  } catch (error) {
    // Якщо офлайн, спробуємо отримати дані з кешу
    if (!navigator.onLine) {
      const userData = offlineStorage.getData('user')
      if (userData) {
        userStore.setUser(userData)
      }
    }
    console.error(error)
  }
}

// Перевіряємо стан мережі та синхронізуємо дані при відновленні
const handleOnlineStatusChange = () => {
  isOffline.value = !navigator.onLine

  if (navigator.onLine) {
    // Коли мережа відновлена, синхронізуємо накопичені запити
    syncOfflineRequests()
  }
}

onMounted(() => {
  getUser()
  setColorScheme('#78dc77')

  // Ініціалізація стану мережі та встановлення слухачів
  isOffline.value = !navigator.onLine
  window.addEventListener('online', handleOnlineStatusChange)
  window.addEventListener('offline', handleOnlineStatusChange)

  // Реєструємо cache worker для офлайн роботи
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('Cache Service Worker зареєстровано', registration)
      })
      .catch((error) => {
        console.error('Cache Service Worker не зареєстровано', error)
      })

    // Зберігаємо існуючий код для notification worker
    navigator.serviceWorker
      .register('/notifications-worker.js')
      .then((registration) => {
        console.log('Notification Service Worker зареєстровано', registration)
        checkNotificationSubscription()
      })
      .catch((error) => {
        console.error('Notification Service Worker не зареєстровано', error)
      })
  }
})

const isUserLoggedIn = computed(() => !!userStore.user.email)

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

const checkNotificationSubscription = async () => {
  const token = localStorage.getItem('token')
  if (!token) {
    console.log('Користувач не авторизований')
    return
  }

  const notificationStatus = localStorage.getItem('notificationSubscription')

  if (notificationStatus === 'subscribed') {
    return
  }

  const permission = await Notification.requestPermission()

  if (permission !== 'granted') {
    console.log('Сповіщення не дозволені користувачем')
    return
  }

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
          .then(() => {
            console.log('Успішно підписано на сповіщення')
            localStorage.setItem('notificationSubscription', 'subscribed')
          })
          .catch((err) => console.error('Помилка при підписці на сповіщення: ', err))
      })
      .catch((err) => console.error('Не вдалося підписатися на сповіщення', err))
  })
}
</script>

<template>
  <main>
    <div v-if="isOffline" class="offline-banner">Ви працюєте в офлайн режимі</div>
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

<style scoped>
.offline-banner {
  background-color: #f8d7da;
  color: #842029;
  padding: 8px;
  text-align: center;
  position: sticky;
  top: 0;
  z-index: 1000;
}
</style>
