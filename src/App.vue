<script setup>
import 'mdui/mdui.css'
import FooterComponent from './components/FooterComponent.vue'
import { RouterView } from 'vue-router'
import { setColorScheme } from 'mdui/functions/setColorScheme.js'
import 'mdui/components/button.js'
import '@khmyznikov/pwa-install'

setColorScheme('#78dc77')
</script>

<template>
  <main>
    <RouterView />
  </main>
  <FooterComponent />
  <pwa-install
    disable-close="true"
    install-description="Встановіть веб-додаток для доступу до повного функціоналу"
    disable-install-description="true"
    disable-screenshots="true"
    manifest-url="/manifest.json"
    name="Pet The Plant"
    description="Pet The Plant — це веб-додаток для догляду за рослинами"
    icon="/icons/icon-128x128.png"
  >
  </pwa-install>
</template>
