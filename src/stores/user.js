import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  // 核心修改：初始化时尝试从 localStorage 读取 userInfo
  const savedUser = localStorage.getItem('userInfo')
  const userInfo = ref(savedUser ? JSON.parse(savedUser) : {
    id: null,
    nickname: '',
    email: '',
    avatar: ''
  })
  
  const token = ref(localStorage.getItem('token') || '')

  // 这里的修改你之前做对了，但需要配合上面的初始化读取才有效
  function setUser(user) {
    userInfo.value = user
    localStorage.setItem('userInfo', JSON.stringify(user))
  }

  function setToken(newToken) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  function logout() {
    userInfo.value = { id: null, nickname: '', email: '', avatar: '' }
    token.value = ''
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  return { userInfo, token, setUser, setToken, logout }
})