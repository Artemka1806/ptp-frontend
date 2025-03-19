<template>
  <div class="loading" :class="{ 'loading-advice': isAdvice }">
    {{ text }}
  </div>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    default: 'Завантаження...',
  },
  isAdvice: {
    type: Boolean,
    default: false,
  },
})
</script>

<style scoped>
.loading {
  text-align: center;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.7);
}

.loading-advice {
  padding: 1rem 0;
  color: rgba(107, 33, 168, 0.7);
}
</style>
