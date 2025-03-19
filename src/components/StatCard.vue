<template>
  <mdui-card :class="['stat-card', type]" outline>
    <div class="card-content">
      <div class="stat-value">
        <transition name="fade" mode="out-in">
          <span :key="value">{{ formattedValue }}</span>
        </transition>
      </div>
      <div class="stat-label">{{ label }}</div>
    </div>
  </mdui-card>
</template>

<script setup>
import { computed } from 'vue'
import 'mdui/components/card.js'

const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: (value) =>
      ['temperature', 'humidity', 'soil-moisture', 'light-level'].includes(value),
  },
  value: {
    type: Number,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  unit: {
    type: String,
    default: '',
  },
})

const formattedValue = computed(() => `${props.value}${props.unit}`)
</script>

<style scoped>
.stat-card {
  border-radius: 12px;
  overflow: hidden;
  transition: box-shadow 0.2s ease;
}

.stat-card:hover {
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.card-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100px;
}

.temperature {
  background-color: #fff5f5;
  color: #b91c1c;
  border: 1px solid rgba(185, 28, 28, 0.15);
}

.humidity {
  background-color: #f0f7ff;
  color: #1e40af;
  border: 1px solid rgba(30, 64, 175, 0.15);
}

.soil-moisture {
  background-color: #f0fbf0;
  color: #15803d;
  border: 1px solid rgba(21, 128, 61, 0.15);
}

.light-level {
  background-color: #fffbeb;
  color: #b45309;
  border: 1px solid rgba(180, 83, 9, 0.15);
}

.stat-value {
  font-size: 24px;
  font-weight: 500;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.85;
}
</style>
