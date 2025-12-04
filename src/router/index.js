import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/login.vue'
import Chat from '../views/chat.vue'
import Profile from '../views/Profile.vue'
import Register from '../views/register.vue' // 1. 引入

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register }, // 2. 配置路由
  { path: '/chat', name: 'Chat', component: Chat },
  { path: '/profile', name: 'Profile', component: Profile }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router