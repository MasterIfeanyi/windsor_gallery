import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { loginAdmin, logoutAdmin, fetchMe } from '../services/authService.js'

export const useAuthStore = defineStore('auth', () => {
  const admin = ref(null)
  // Have we already asked the server who is logged in?
  const isChecked = ref(false)

  const isLoggedIn = computed(() => admin.value !== null)

  // Runs once. A 401 simply means nobody is logged in, which is not a bug.
  const checkSession = async () => {
    if (isChecked.value) return

    try {
      admin.value = await fetchMe()
    } catch {
      admin.value = null
    } finally {
      isChecked.value = true
    }
  }

  const login = async (email, password) => {
    admin.value = await loginAdmin(email, password)
    isChecked.value = true
  }

  const logout = async () => {
    try {
      await logoutAdmin()
    } finally {
      admin.value = null
    }
  }

  return { admin, isLoggedIn, checkSession, login, logout }
})
