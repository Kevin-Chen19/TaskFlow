/**
 * 登录状态管理
 * 登录/注册方法
Token 持久化存储
自动恢复登录状态
 */
import { ref } from 'vue'
import { defineStore } from 'pinia'
import { login as loginApi, register as registerApi, getCurrentUser } from '@/api'
import type { User } from '@/types/user'

export const useLoginStore = defineStore('login', () => {
  const ifSignUp = ref(false)
  const ifForgot = ref(false)
  const token = ref<string>('')
  const user = ref<User | null>(null)
  const isLoggedIn = ref(false)

  // 登录
  const login = async (credentials: {
    phone?: string
    email?: string
    password: string
  }) => {
    try {
      const res = await loginApi(credentials)
      if (res.success && res.data) {
        token.value = res.data.token
        user.value = res.data
        isLoggedIn.value = true

        // 持久化存储
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('user', JSON.stringify(res.data))
      }
      return res
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    }
  }

  // 注册
  const register = async (data: {
    phone: string
    fullname: string
    email: string
    password: string
    avatar_url?: string
    skills?: string[]
    mooto?: string
  }) => {
    try {
      const res = await registerApi(data)
      return res
    } catch (error) {
      console.error('注册失败:', error)
      throw error
    }
  }

  // 退出登录
  const logout = () => {
    token.value = ''
    user.value = null
    isLoggedIn.value = false
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  // 从 localStorage 恢复登录状态
  const restoreAuth = () => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')

    if (savedToken && savedUser) {
      token.value = savedToken
      user.value = JSON.parse(savedUser)
      isLoggedIn.value = true
    }
  }

  // 获取当前用户信息
  const fetchCurrentUser = async () => {
    try {
      const res = await getCurrentUser()
      if (res.success && res.data) {
        user.value = res.data
        localStorage.setItem('user', JSON.stringify(res.data))
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  }

  return {
    ifSignUp,
    ifForgot,
    token,
    user,
    isLoggedIn,
    login,
    register,
    logout,
    restoreAuth,
    fetchCurrentUser
  }
})
