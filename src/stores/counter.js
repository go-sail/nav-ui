import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)
  function increment() {
    count.value++
  }

  return { count, doubleCount, increment }
})

// 主题管理 store
export const useThemeStore = defineStore('theme', () => {
  const isDarkMode = ref(false)

  // 从 localStorage 读取保存的主题
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    isDarkMode.value = savedTheme === 'dark'
  } else {
    // 检测系统主题偏好
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    isDarkMode.value = prefersDark
  }

  // 切换主题
  function toggleTheme() {
    isDarkMode.value = !isDarkMode.value
    localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
    updateDocumentTheme()
  }

  // 设置主题
  function setTheme(theme) {
    isDarkMode.value = theme === 'dark'
    localStorage.setItem('theme', theme)
    updateDocumentTheme()
  }

  // 更新文档主题类
  function updateDocumentTheme() {
    if (isDarkMode.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // 初始化主题
  updateDocumentTheme()

  return { isDarkMode, toggleTheme, setTheme }
})
