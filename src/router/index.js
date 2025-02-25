import { createRouter, createWebHistory } from 'vue-router'

import PlantsView from '@/views/PlantsView.vue'
import ProfileView from '@/views/ProfileView.vue'
import SignupView from '@/views/SignupView.vue'
import LoginView from '@/views/LoginView.vue'
import AddPlantView from '@/views/AddPlantView.vue'
import HistoryView from '@/views/HistoryView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/plants',
    },
    {
      path: '/plants',
      name: 'plants',
      component: PlantsView,
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignupView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/add-plant',
      name: 'add-plant',
      component: AddPlantView,
    },
    {
      path: '/history',
      name: 'history',
      component: HistoryView,
    }
  ],
})

router.beforeEach(async (to) => {
  let haveToken = localStorage.getItem('token')
  if (
    !haveToken &&
    (to.name !== 'login' && to.name !== 'signup')
  ) {
    return { name: 'login' }
  }
})

export default router
