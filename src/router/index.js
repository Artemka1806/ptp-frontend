import { createRouter, createWebHistory } from 'vue-router'

import PlantsView from '@/views/PlantsView.vue'
import ProfileView from '@/views/ProfileView.vue'
import SignupView from '@/views/SignupView.vue'
import LoginView from '@/views/LoginView.vue'

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
