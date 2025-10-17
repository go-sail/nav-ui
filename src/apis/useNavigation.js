import { ref } from 'vue'

const checkErrorCode = (code) => {
  //令牌失效
  if (code === 1001) {
    localStorage.removeItem('token')
    localStorage.removeItem('admin_authenticated')
    alert('令牌失效，请重新登录')
    location.reload()
  }
}

export function useNavigation() {
   const NAVIGATION_API_BASE = import.meta.env.VITE_NAVIGATION_API_BASE


  const categories = ref([])
  const title = ref('')
  const defaultSearchEngine = ref('bing')
  const loading = ref(false)
  const error = ref(null)

  const fetchCategories = async () => {
    loading.value = true
    error.value = null

    // 对路径进行URL编码，但保留斜杠
    const url = `${NAVIGATION_API_BASE}/apis/index/list`

    console.log('Nav API请求URL:', url)
    console.log('Website Title:', import.meta.env.VITE_WEBSITE_TITLE)

    // 创建超时控制
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10秒超时
    const token = localStorage.getItem('token')

    try {
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `${token}`,
          'Accept': 'application/json',
        },
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      console.log('Nav API响应状态:', response.status, response.statusText)

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        try {
          const error = await response.json()
          errorMessage = `Nav API Error: ${error.message}`
        } catch {
          // 如果无法解析错误响应，使用基本错误信息
          console.log('无法解析Nav API错误响应')
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log('Nav API响应数据:', data)

      checkErrorCode(data.code)

      if (!data.data.list) {
        throw new Error('Nav API返回的数据中没有data.list字段')
      }

      categories.value = data.data.list
      title.value = import.meta.env.VITE_WEBSITE_TITLE

      // 设置默认搜索引擎，如果未指定或不存在则使用bing
      defaultSearchEngine.value = 'bing'

      // 动态设置页面标题
      document.title = title.value
    } catch (err) {
      error.value = err.message
      console.error('Error fetching categories:', err)
    } finally {
      loading.value = false
    }
  }

  const userLogin = async (username, password) => {

    // 对路径进行URL编码，但保留斜杠
    const url = `${NAVIGATION_API_BASE}/apis/user/login`

    console.log('Nav API请求URL:', url)

    // 创建超时控制
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10秒超时

    try {

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      console.log('Nav API响应状态:', response.status, response.statusText)

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        try {
          const error = await response.json()
          errorMessage = `Nav API Error: ${error.message}`
        } catch {
          // 如果无法解析错误响应，使用基本错误信息
          console.log('无法解析Nav API错误响应')
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log('Nav API响应数据:', data)

      checkErrorCode(data.code)

      if (data.code !== 200) {
        throw new Error(data.message)
      }

      localStorage.setItem('token', data.data.token)
      localStorage.setItem('admin_authenticated', 'true')

      return data.data.token
    } catch (err) {
      error.value = err.message
      console.error('Error user login:', err)
    } finally {
      loading.value = false
    }
  }

  const userLogout = async () => {

    // 对路径进行URL编码，但保留斜杠
    const url = `${NAVIGATION_API_BASE}/apis/user/logout`
    const token = localStorage.getItem('token')

    console.log('Nav API请求URL:', url)

    // 创建超时控制
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10秒超时

    try {

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      console.log('Nav API响应状态:', response.status, response.statusText)

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        try {
          const error = await response.json()
          errorMessage = `Nav API Error: ${error.message}`
        } catch {
          // 如果无法解析错误响应，使用基本错误信息
          console.log('无法解析Nav API错误响应')
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log('Nav API响应数据:', data)

      checkErrorCode(data.code)

      if (data.code !== 200) {
        throw new Error(data.message)
      }
      localStorage.removeItem('token')
      localStorage.removeItem('admin_authenticated')
    } catch (err) {
      error.value = err.message
      console.error('Error user logout:', err)
    } finally {
      loading.value = false
    }
  }

  const getNavList = async () => {

    // 对路径进行URL编码，但保留斜杠
    const url = `${NAVIGATION_API_BASE}/apis/nav/list`
    const token = localStorage.getItem('token')

    console.log('Nav API请求URL:', url)

    // 创建超时控制
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10秒超时

    try {

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `${token}`,
          'Accept': 'application/json',
        },
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      console.log('Nav API响应状态:', response.status, response.statusText)

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        try {
          const error = await response.json()
          errorMessage = `Nav API Error: ${error.message}`
        } catch {
          // 如果无法解析错误响应，使用基本错误信息
          console.log('无法解析Nav API错误响应')
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log('Nav API响应数据:', data)

      checkErrorCode(data.code)

      if (data.code !== 200) {
        throw new Error(data.message)
      }

      return data.data.list
    } catch (err) {
      error.value = err.message
      console.error('Error get nav list:', err)
    } finally {
      loading.value = false
    }
  }

  const getCategories = async () => {

    // 对路径进行URL编码，但保留斜杠
    const url = `${NAVIGATION_API_BASE}/apis/nav/categories`
    const token = localStorage.getItem('token')

    console.log('Nav API请求URL:', url)

    // 创建超时控制
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10秒超时

    try {

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `${token}`,
          'Accept': 'application/json',
        },
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      console.log('Nav API响应状态:', response.status, response.statusText)

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        try {
          const error = await response.json()
          errorMessage = `Nav API Error: ${error.message}`
        } catch {
          // 如果无法解析错误响应，使用基本错误信息
          console.log('无法解析Nav API错误响应')
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log('Nav API响应数据:', data)

      checkErrorCode(data.code)

      if (data.code !== 200) {
        throw new Error(data.message)
      }

      return data.data.list
    } catch (err) {
      error.value = err.message
      console.error('Error get nav list:', err)
    } finally {
      loading.value = false
    }
  }

  const getSites = async (categoryId) => {

    // 对路径进行URL编码，但保留斜杠
    const url = `${NAVIGATION_API_BASE}/apis/nav/sites?categoryId=${categoryId}`
    const token = localStorage.getItem('token')

    console.log('Nav API请求URL:', url)

    // 创建超时控制
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10秒超时

    try {

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `${token}`,
          'Accept': 'application/json',
        },
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      console.log('Nav API响应状态:', response.status, response.statusText)

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        try {
          const error = await response.json()
          errorMessage = `Nav API Error: ${error.message}`
        } catch {
          // 如果无法解析错误响应，使用基本错误信息
          console.log('无法解析Nav API错误响应')
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log('Nav API响应数据:', data)

      checkErrorCode(data.code)

      if (data.code !== 200) {
        throw new Error(data.message)
      }

      return data.data.list
    } catch (err) {
      error.value = err.message
      console.error('Error get sites:', err)
    } finally {
      loading.value = false
    }
  }

  const saveCategory = async (category) => {

    // 对路径进行URL编码，但保留斜杠
    const url = `${NAVIGATION_API_BASE}/apis/nav/category`
    const token = localStorage.getItem('token')

    console.log('Nav API请求URL:', url)

    // 创建超时控制
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10秒超时

    try {

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(category),
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      console.log('Nav API响应状态:', response.status, response.statusText)

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        try {
          const error = await response.json()
          errorMessage = `Nav API Error: ${error.message}`
        } catch {
          // 如果无法解析错误响应，使用基本错误信息
          console.log('无法解析Nav API错误响应')
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log('Nav API响应数据:', data)

      checkErrorCode(data.code)

      if (data.code !== 200) {
        throw new Error(data.message)
      }
    } catch (err) {
      error.value = err.message
      console.error('Error save category:', err)
    } finally {
      loading.value = false
    }
  }

  const saveSite = async (site) => {

    // 对路径进行URL编码，但保留斜杠
    const url = `${NAVIGATION_API_BASE}/apis/nav/site`
    const token = localStorage.getItem('token')

    console.log('Nav API请求URL:', url)

    // 创建超时控制
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10秒超时

    try {

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(site),
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      console.log('Nav API响应状态:', response.status, response.statusText)

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        try {
          const error = await response.json()
          errorMessage = `Nav API Error: ${error.message}`
        } catch {
          // 如果无法解析错误响应，使用基本错误信息
          console.log('无法解析Nav API错误响应')
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log('Nav API响应数据:', data)

      checkErrorCode(data.code)

      if (data.code !== 200) {
        throw new Error(data.message)
      }
    } catch (err) {
      error.value = err.message
      console.error('Error save site:', err)
    } finally {
      loading.value = false
    }
  }

  const deleteCategory = async (categoryId) => {

    // 对路径进行URL编码，但保留斜杠
    const url = `${NAVIGATION_API_BASE}/apis/nav/category?identity=${categoryId}`
    const token = localStorage.getItem('token')

    console.log('Nav API请求URL:', url)

    // 创建超时控制
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10秒超时

    try {

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `${token}`,
          'Accept': 'application/json',
        },
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      console.log('Nav API响应状态:', response.status, response.statusText)

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        try {
          const error = await response.json()
          errorMessage = `Nav API Error: ${error.message}`
        } catch {
          // 如果无法解析错误响应，使用基本错误信息
          console.log('无法解析Nav API错误响应')
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log('Nav API响应数据:', data)

      checkErrorCode(data.code)

      if (data.code !== 200) {
        throw new Error(data.message)
      }
    } catch (err) {
      error.value = err.message
      console.error('Error delete category:', err)
    } finally {
      loading.value = false
    }
  }

  const deleteSite = async (siteId) => {

    // 对路径进行URL编码，但保留斜杠
    const url = `${NAVIGATION_API_BASE}/apis/nav/site?identity=${siteId}`
    const token = localStorage.getItem('token')

    console.log('Nav API请求URL:', url)

    // 创建超时控制
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10秒超时

    try {

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `${token}`,
          'Accept': 'application/json',
        },
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      console.log('Nav API响应状态:', response.status, response.statusText)

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        try {
          const error = await response.json()
          errorMessage = `Nav API Error: ${error.message}`
        } catch {
          // 如果无法解析错误响应，使用基本错误信息
          console.log('无法解析Nav API错误响应')
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log('Nav API响应数据:', data)

      checkErrorCode(data.code)

      if (data.code !== 200) {
        throw new Error(data.message)
      }
    } catch (err) {
      error.value = err.message
      console.error('Error delete site:', err)
    } finally {
      loading.value = false
    }
  }

  const sortCategories = async (identities) => {

    // 对路径进行URL编码，但保留斜杠
    const url = `${NAVIGATION_API_BASE}/apis/nav/category/sorted`
    const token = localStorage.getItem('token')

    console.log('Nav API请求URL:', url)

    // 创建超时控制
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10秒超时

    try {

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identities: identities }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      console.log('Nav API响应状态:', response.status, response.statusText)

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        try {
          const error = await response.json()
          errorMessage = `Nav API Error: ${error.message}`
        } catch {
          // 如果无法解析错误响应，使用基本错误信息
          console.log('无法解析Nav API错误响应')
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log('Nav API响应数据:', data)

      checkErrorCode(data.code)

      if (data.code !== 200) {
        throw new Error(data.message)
      }
    } catch (err) {
      error.value = err.message
      console.error('Error sort categories:', err)
    } finally {
      loading.value = false
    }
  }

  const sortSites = async (categoryId, identities) => {

    // 对路径进行URL编码，但保留斜杠
    const url = `${NAVIGATION_API_BASE}/apis/nav/site/sorted`
    const token = localStorage.getItem('token')

    console.log('Nav API请求URL:', url)

    // 创建超时控制
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10秒超时

    try {

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ categoryIdentity: categoryId, identities: identities }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      console.log('Nav API响应状态:', response.status, response.statusText)

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        try {
          const error = await response.json()
          errorMessage = `Nav API Error: ${error.message}`
        } catch {
          // 如果无法解析错误响应，使用基本错误信息
          console.log('无法解析Nav API错误响应')
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log('Nav API响应数据:', data)

      checkErrorCode(data.code)

      if (data.code !== 200) {
        throw new Error(data.message)
      }
    } catch (err) {
      error.value = err.message
      console.error('Error sort sites:', err)
    } finally {
      loading.value = false
    }
  }

  const uploadIcon = async (action, file) => {

    // 对路径进行URL编码，但保留斜杠
    const url = `${NAVIGATION_API_BASE}/apis/common/upload`

    console.log('Nav API请求URL:', url)

    // 创建超时控制
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10秒超时

    try {

      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('action', action)
      formData.append('file', file)

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `${token}`,
        },
        body: formData,
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      console.log('Nav API响应状态:', response.status, response.statusText)

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        try {
          const error = await response.json()
          errorMessage = `Nav API Error: ${error.message}`
        } catch {
          // 如果无法解析错误响应，使用基本错误信息
          console.log('无法解析Nav API错误响应')
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log('Nav API响应数据:', data)

      checkErrorCode(data.code)

      if (data.code !== 200) {
        throw new Error(data.message)
      }

      return data.data.url
    } catch (err) {
      error.value = err.message
      console.error('Error upload icon:', err)
    } finally {
      loading.value = false
    }
  }

  const syncRemoteAsset = async (action, assetUrl) => {

    // 对路径进行URL编码，但保留斜杠
    const url = `${NAVIGATION_API_BASE}/apis/common/sync-remote-asset`

    console.log('Nav API请求URL:', url)

    // 创建超时控制
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10秒超时
    const token = localStorage.getItem('token')
    try {

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: action, url: assetUrl }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      console.log('Nav API响应状态:', response.status, response.statusText)

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        try {
          const error = await response.json()
          errorMessage = `Nav API Error: ${error.message}`
        } catch {
          // 如果无法解析错误响应，使用基本错误信息
          console.log('无法解析Nav API错误响应')
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log('Nav API响应数据:', data)

      checkErrorCode(data.code)

      if (data.code !== 200) {
        throw new Error(data.message)
      }

      return data.data.url
    } catch (err) {
      error.value = err.message
      console.error('Error sync remote asset:', err)
    } finally {
      loading.value = false
    }
  }


  return {
    categories,
    title,
    defaultSearchEngine,
    loading,
    error,
    fetchCategories,
    userLogin,
    userLogout,
    getNavList,
    getCategories,
    getSites,
    saveCategory,
    saveSite,
    deleteCategory,
    deleteSite,
    sortCategories,
    sortSites,
    uploadIcon,
    syncRemoteAsset
  }
}
