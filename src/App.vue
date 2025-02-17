<script setup>
import 'mdui/mdui.css'
import FooterComponent from './components/FooterComponent.vue'
import { RouterView } from 'vue-router'
import { setColorScheme } from 'mdui/functions/setColorScheme.js'

setColorScheme('#78dc77')
// This variable will save the event for later use.
let deferredPrompt
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevents the default mini-infobar or install dialog from appearing on mobile
  e.preventDefault()
  // Save the event because you'll need to trigger it later.
  deferredPrompt = e
  // Show your customized install prompt for your PWA
  // Your own UI doesn't have to be a single element, you
  // can have buttons in different locations, or wait to prompt
  // as part of a critical journey.
  showInAppInstallPromotion()
})
</script>
<template>
  <main>
    <RouterView />
  </main>
  <footer>
    <FooterComponent />
  </footer>
</template>
