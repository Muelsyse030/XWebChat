import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  // 定义默认空用户对象
  const defaultUser = {
    id: null,
    nickname: '',
    email: '',
    avatar: ''
  }

  // 1. 安全地初始化用户信息（加了 try-catch）
  const storedUser = localStorage.getItem('userInfo')
  let initialUser = defaultUser
  try {
    if (storedUser && storedUser !== 'undefined') {
      initialUser = JSON.parse(storedUser)
    }
  } catch (e) {
    console.error('用户信息解析失败，重置为默认值', e)
    localStorage.removeItem('userInfo')
  }

  const userInfo = ref(initialUser)
  const token = ref(localStorage.getItem('token') || '')

  // 2. 设置用户信息
  function setUser(user) {
    userInfo.value = user
    localStorage.setItem('userInfo', JSON.stringify(user))
  }

  // 3. 设置 Token
  function setToken(newToken) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  // 4. 登出
  function logout() {
    userInfo.value = { ...defaultUser }
    token.value = ''
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  return { userInfo, token, setUser, setToken, logout }
})