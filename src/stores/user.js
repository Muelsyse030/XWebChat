// src/stores/user.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  // 用户信息
  const userInfo = ref({
    id: null,
    nickname: '',
    email: '',
    avatar: ''
  })
  
  // Token
  const token = ref(localStorage.getItem('token') || '')

  // 设置用户信息
  function setUser(user) {
    userInfo.value = user
  }

  // 设置 Token
  function setToken(newToken) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  // 登出
  function logout() {
    userInfo.value = {}
    token.value = ''
    localStorage.removeItem('token')
  }

  return { userInfo, token, setUser, setToken, logout }
})