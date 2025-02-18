<template>
  <div class="profile-container" v-if="userStore.user.name">
    <div class="avatar-container">
      <mdui-avatar class="avatar">{{ initial }}</mdui-avatar>
    </div>
    <div class="user-info">
      <div class="user-name">{{ userStore.user.name || 'No Name' }}</div>
      <div class="user-email">{{ userStore.user.email }}</div>
    </div>
    <div class="logout-container">
      <mdui-button @click="logout">
        <mdui-icon-logout slot="icon"></mdui-icon-logout>
        Вийти з акаунту
      </mdui-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
import 'mdui/components/avatar.js'
import 'mdui/components/button.js'
import '@mdui/icons/logout.js'

const userStore = useUserStore()

const initial = computed(() => {
  return userStore.user.name ? userStore.user.name[0] : ''
})

const logout = () => {
  userStore.logout()
}
</script>

<style scoped>
.profile-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  margin: auto;
  padding: 10px 20px;
}

.avatar-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar {
  width: 100px;
  height: 100px;
  font-size: 60px;
}

.user-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.user-name {
  font-size: 24px;
  font-weight: 500;
}

.user-email {
  font-size: 16px;
  color: #666;
}

.logout-container {
  margin-top: 20px;
}
</style>
