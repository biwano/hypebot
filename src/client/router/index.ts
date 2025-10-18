import { createRouter, createWebHistory } from 'vue-router'
import BotsPage from '../components/BotsPage.vue'
import DebugPage from '../components/DebugPage.vue'

const routes = [
  {
    path: '/',
    name: 'bots',
    component: BotsPage
  },
  {
    path: '/debug',
    name: 'debug',
    component: DebugPage
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
