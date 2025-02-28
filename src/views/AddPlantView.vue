<template>
  <div class="container">
    <qrcode-stream
      @detect="onDetect"
      :track="paintBoundingBox"
      :paused="paused"
      class="qr-scanner"
    ></qrcode-stream>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { prompt } from 'mdui/functions/prompt.js'
import { createPlant } from '@/http'
import router from '@/router'

const result = ref('')
const paused = ref(false)

const onDetect = async (detectedCodes) => {
  result.value = detectedCodes[0]?.rawValue || ''
  if (result.value) {
    paused.value = true
    try {
      prompt({
        title: 'Назва рослини',
        description: `Введіть назву Вашої рослини`,
        onConfirm: async (value) => {
          enterPlantType(value)
        },
        onCancel: () => {
          paused.value = false
        },
      })
    } catch (error) {
      console.error(error)
    }
  }
}

const enterPlantType = async (name) => {
  try {
    prompt({
      title: 'Вид рослини',
      description: `Введіть вид Вашої рослини`,
      onConfirm: async (type) => {
        await createPlant({ name: name, type: type, сode: result.value })
        router.push({ name: 'plants' })
      },
      onCancel: () => {
        paused.value = false
      },
    })
  } catch (error) {
    console.error(error)
  }
}

const paintBoundingBox = (detectedCodes, ctx) => {
  for (const detectedCode of detectedCodes) {
    const {
      boundingBox: { x, y, width, height },
    } = detectedCode

    ctx.lineWidth = 4
    ctx.strokeStyle = '#78dc77'
    ctx.strokeRect(x, y, width, height)
  }
  // alert(result.value)
}
</script>
<style scoped>
.container {
  margin-top: 10%;
}
</style>
