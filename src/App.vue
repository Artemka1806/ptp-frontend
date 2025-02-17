<script setup>
import { ref, onMounted } from 'vue'
import 'mdui/mdui.css'
import FooterComponent from './components/FooterComponent.vue'
import { RouterView } from 'vue-router'
import { setColorScheme } from 'mdui/functions/setColorScheme.js'
import 'mdui/components/button.js'

setColorScheme('#78dc77')

const deferredPrompt = ref(null)
const showInstallButton = ref(false)

onMounted(() => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt.value = e
    showInstallButton.value = true
  })
})

function installPWA() {
  if (!deferredPrompt.value) return
  deferredPrompt.value.prompt()
  deferredPrompt.value = null
  showInstallButton.value = false
}
</script>

<template>
  <main>
    <RouterView />
  </main>
  <FooterComponent />
  <div class="background-container" v-if="showInstallButton">
    <h1>Щоб продовжити треба встановити додаток або додати сайт на початковий екран</h1>
    <mdui-button full-width @click="installPWA" class="install-button"
      >Встановити додаток</mdui-button
    >
  </div>
</template>

<style scoped>
.background-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgb(var(--mdui-color-background-dark));
  z-index: 1000;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 10px 20px;
}

.install-button {
  margin-top: 50%;
}
</style>
