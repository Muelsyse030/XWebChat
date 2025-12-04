import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  // 1. 修改：初始化时尝试从 localStorage 读取
  const savedUser = localStorage.getItem('userInfo')
  const userInfo = ref(savedUser ? JSON.parse(savedUser) : {
    id: null,
    nickname: '',
    email: '',
    avatar: ''
  })
  
  const token = ref(localStorage.getItem('token') || '')

  // 2. 修改：设置时同步写入 localStorage
  function setUser(user) {
    userInfo.value = user
    localStorage.setItem('userInfo', JSON.stringify(user))
  }

  function setToken(newToken) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  // 3. 修改：登出时清除
  function logout() {
    userInfo.value = { id: null, nickname: '', email: '', avatar: '' }
    token.value = ''
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  return { userInfo, token, setUser, setToken, logout }
})