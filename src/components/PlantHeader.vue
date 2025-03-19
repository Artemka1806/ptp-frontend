<template>
  <div class="header-container">
    <div class="plant-navigation" v-if="showNavigation">
      <mdui-button class="arrow-button" @click="$emit('prev')">
        <mdui-icon-chevron-left></mdui-icon-chevron-left>
      </mdui-button>

      <div class="plant-counter">{{ currentIndex + 1 }}/{{ total }}</div>

      <mdui-button class="arrow-button" @click="$emit('next')">
        <mdui-icon-chevron-right></mdui-icon-chevron-right>
      </mdui-button>
    </div>

    <div class="plant-header">
      <div class="plant-icon"><span>🌱</span></div>
      <div class="plant-name">{{ name }}</div>
      <div v-if="showDelete" class="plant-icon delete-icon" @click="$emit('delete')">
        <span>🗑️</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  name: {
    type: String,
    required: true,
  },
  currentIndex: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    default: 0,
  },
  showNavigation: {
    type: Boolean,
    default: false,
  },
  showDelete: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['prev', 'next', 'delete'])
</script>

<style scoped>
.header-container {
  padding: 20px 20px 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.plant-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 800px;
  margin-bottom: 15px;
}

.arrow-button {
  width: 80px;
}

.plant-counter {
  font-size: 22px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  text-align: center;
  flex-grow: 1;
}

.plant-header {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 800px;
  margin-top: 5px;
}

.plant-icon {
  width: 46px;
  height: 46px;
  background-color: rgb(var(--mdui-color-surface-container-high-dark));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  margin-left: 10px;
  font-size: 24px;
}

.delete-icon {
  margin-left: auto;
  margin-right: 10px;
  cursor: pointer;
}

.plant-name {
  font-size: 36px;
  font-weight: 600;
  color: #ffffff;
  letter-spacing: 0.5px;
}
</style>
