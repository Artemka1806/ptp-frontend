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

const paused = ref(false)
const result = ref('')

const onDetect = async (detectedCodes) => {
  result.value = JSON.stringify(detectedCodes.map((code) => code.rawValue))
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
  margin-top: 50%;
}
</style>
