import axios from 'axios'

/**
 * 지침에 따른 단일 axios 인스턴스
 * - 모든 API 호출의 중앙 집중화
 * - 인터셉터를 통한 토큰 관리
 * - 에러 처리 표준화
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000',
  withCredentials: true, // HttpOnly 쿠키 전송을 위해 필요
  timeout: 60000, // 60초 타임아웃
})

// 토큰 갱신 중인지 확인하는 플래그 (지침에 따른 중복 방지)
let refreshing = false
// 갱신 대기 중인 요청들을 저장하는 배열
let queue = []

// 쿠키에서 특정 이름의 값을 가져오는 함수 (CSRF 토큰용)
function getCookie(name) {
  let cookieValue = null
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';')
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim()
      if (cookie.substring(0, name.length + 1) === name + '=') {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1))
        break
      }
    }
  }
  return cookieValue
}

// 요청 인터셉터 - 지침에 따른 access token 주입
api.interceptors.request.use(
  async (config) => {
    // 동적 import로 순환 참조 방지
    const { useAuthStore } = await import('@/stores/auth')
    const authStore = useAuthStore()

    // Access token이 있으면 Authorization 헤더 추가
    if (authStore.accessToken) {
      config.headers.Authorization = `Bearer ${authStore.accessToken}`
    }

    // POST, PUT, PATCH, DELETE 요청에 CSRF 토큰 추가
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(config.method.toUpperCase())) {
      const csrfToken = getCookie('csrftoken')
      if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken
      }
    }

    return config
  },
  (error) => {
    console.error('❌ [API][REQ] 요청 설정 오류:', error)
    return Promise.reject(error)
  },
)

// 응답 인터셉터 - 지침에 따른 401 처리
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // 401 에러 처리 (지침에 따른 패턴)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      // 로그아웃 요청의 401은 정상적인 경우
      if (originalRequest.url?.includes('/auth/auth/jwt/logout/')) {
        return Promise.reject(error)
      }

      // 토큰 갱신 요청의 401은 refresh token 만료
      if (originalRequest.url?.includes('/auth/auth/jwt/refresh/')) {
        const { useAuthStore } = await import('@/stores/auth')
        const authStore = useAuthStore()
        authStore.resetAuth()
        return Promise.reject(error)
      }

      // 중복 refresh 방지 (지침에 따른 패턴)
      if (refreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject })
        })
          .then(() => {
            return api(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      refreshing = true
      try {
        const { useAuthStore } = await import('@/stores/auth')
        const authStore = useAuthStore()

        await authStore.silentRefresh()

        // 대기 중인 요청들 재시도
        queue.forEach(({ resolve }) => resolve())
        queue = []

        return api(originalRequest)
      } catch (refreshError) {
        // 갱신 실패 시 대기 중인 요청들 모두 실패 처리
        queue.forEach(({ reject }) => reject(refreshError))
        queue = []

        const { useAuthStore } = await import('@/stores/auth')
        const authStore = useAuthStore()
        authStore.resetAuth()

        return Promise.reject(error)
      } finally {
        refreshing = false
      }
    }

    // 전역 오류 처리 - 특정 엔드포인트는 Toast 표시 제외
    if (error.response) {
      const skipToastUrls = [
        '/auth/auth/jwt/login/',
        '/auth/auth/jwt/refresh/',
        '/auth/auth/jwt/logout/',
        '/auth/auth/signup/',
        '/auth/auth/verify-email/',
      ]

      const shouldShowToast = !skipToastUrls.some((url) => originalRequest.url?.includes(url))

      if (shouldShowToast) {
        // 동적 import로 순환 참조 방지
        import('@/composables/useToast')
          .then(({ toast }) => {
            const message =
              error.response?.data?.detail ||
              error.response?.data?.message ||
              '서버 오류가 발생했습니다.'
            toast.error(message)
          })
          .catch((err) => {
            console.error('❌ [API][RES] Toast 표시 실패:', err)
          })
      }
    } else if (error.request) {
      // 네트워크 오류는 항상 Toast로 표시
      import('@/composables/useToast')
        .then(({ toast }) => {
          toast.error('네트워크 연결을 확인해주세요.')
        })
        .catch((err) => {
          console.error('❌ [API][RES] Toast 표시 실패:', err)
        })
    }

    return Promise.reject(error)
  },
)

export default api
