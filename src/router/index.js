import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/login.vue'
import Chat from '../views/chat.vue'
import Profile from '../views/Profile.vue'
import Register from '../views/register.vue' // 1. 引入
import { useUserStore } from '@/stores/user'

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

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  // 定义不需要登录的白名单路由
  const whiteList = ['/login', '/register']
  
  if (userStore.token) {
    // 已登录，如果去登录/注册页，重定向到聊天页
    if (whiteList.includes(to.path)) {
      next('/chat')
    } else {
      next()
    }
  } else {
    // 未登录
    if (whiteList.includes(to.path)) {
      next()
    } else {
      next('/login')
    }
  }
})

export default router