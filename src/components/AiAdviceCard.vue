<template>
  <div class="advice-container" v-if="!loading && loaded">
    <mdui-card class="advice-card" outline>
      <div class="card-content advice-content">
        <div class="advice-header">
          <div class="advice-icon">🤖</div>
          <div class="advice-title">{{ title }}</div>
          <div class="info-icon" @click="$emit('info')">ℹ️</div>
        </div>
        <div :class="['advice-text', { 'weekly-advice-text': isWeekly }]"></div>
      </div>
    </mdui-card>
  </div>
</template>

<script setup>
import { onUnmounted, watch } from 'vue'
import Typed from 'typed.js'

const props = defineProps({
  advice: {
    type: String,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  loaded: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: 'Порада від ШІ',
  },
  isWeekly: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['info'])

let typedInstance = null

watch(
  () => props.loaded,
  (newLoaded) => {
    if (newLoaded && props.advice) {
      if (typedInstance) {
        typedInstance.destroy()
      }

      setTimeout(() => {
        const options = {
          strings: [props.advice],
          typeSpeed: 10,
          showCursor: false,
          loop: false,
        }

        typedInstance = new Typed(
          `.${props.isWeekly ? 'weekly-advice-text' : 'advice-text'}`,
          options,
        )
      }, 100)
    }
  },
)

onUnmounted(() => {
  if (typedInstance) {
    typedInstance.destroy()
  }
})
</script>

<style scoped>
.advice-container {
  width: 100%;
  margin: 0 auto;
}

.info-icon {
  font-size: 14px;
  margin-left: auto;
  cursor: pointer;
  background-color: rgba(107, 33, 168, 0.1);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
  position: relative;
  top: -2px;
  padding-bottom: 0.7px;
}

.info-icon:hover {
  background-color: rgba(107, 33, 168, 0.2);
}

.advice-card {
  border-radius: 12px;
  overflow: hidden;
  transition: box-shadow 0.2s ease;
  background-color: #f3e8ff;
  color: #6b21a8;
  min-width: 50%;
  border: 1px solid rgba(107, 33, 168, 0.15);
}

.advice-card:hover {
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.advice-content {
  align-items: flex-start;
  padding: 16px 20px;
}

.advice-header {
  display: flex;
  align-items: center;
  align-self: flex-start;
  margin-bottom: 14px;
  width: 100%;
}

.advice-icon {
  font-size: 18px;
  margin-right: 8px;
}

.advice-title {
  font-size: 16px;
  font-weight: 500;
}

.advice-text {
  width: 100%;
  font-size: 16px;
  opacity: 0.9;
  padding-top: 4px;
  white-space: pre-line;
}
</style>
