import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // Treat all tags starting with mdui- as mdui components and pwa-install as a custom element
          isCustomElement: (tag) => tag.startsWith('mdui-') || tag === 'pwa-install'
        }
      }
    }),
    vueDevTools(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg}'],
      },
      manifest: {
        name: "Pet The Plant",
        short_name: "Pet The Plant",
        description: "Pet The Plant - Making plant care smarter 🪴",
        theme_color: "#78dc77",
        icons: [
          {
            "src": "icons/icon-48x48.png",
            "sizes": "48x48",
            "type": "image/png"
          },
          {
            "src": "icons/icon-72x72.png",
            "sizes": "72x72",
            "type": "image/png"
          },
          {
            "src": "icons/icon-96x96.png",
            "sizes": "96x96",
            "type": "image/png"
          },
          {
            "src": "icons/icon-128x128.png",
            "sizes": "128x128",
            "type": "image/png"
          },
          {
            "src": "icons/icon-144x144.png",
            "sizes": "144x144",
            "type": "image/png"
          },
          {
            "src": "icons/icon-152x152.png",
            "sizes": "152x152",
            "type": "image/png"
          },
          {
            "src": "icons/icon-192x192.png",
            "sizes": "192x192",
            "type": "image/png"
          },
          {
            "src": "icons/icon-256x256.png",
            "sizes": "256x256",
            "type": "image/png"
          },
          {
            "src": "icons/icon-384x384.png",
            "sizes": "384x384",
            "type": "image/png"
          },
          {
            "src": "icons/icon-512x512.png",
            "sizes": "512x512",
            "type": "image/png"
          }
        ],
        display: "standalone",
        orientation: "portrait",
        background_color: "#1a1c19",
        start_url: "/",
        lang: "uk",
        shortcuts: [
          {
            "name": "Рослини",
            "url": "/plants",
            "icons": [
              {
                "src": "icons/plant.png",
                "sizes": "96x96",
                "type": "image/png"
              }
            ]
          },
          {
            "name": "Додати рослину",
            "url": "/add-plant",
            "icons": [
              {
                "src": "icons/add.png",
                "sizes": "96x96",
                "type": "image/png"
              }
            ]
          },
          {
            "name": "Профіль",
            "url": "/profile",
            "icons": [
              {
                "src": "icons/profile.png",
                "sizes": "96x96",
                "type": "image/png"
              }
            ]
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
