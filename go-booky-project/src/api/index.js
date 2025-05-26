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
  timeout: 60000, // 60초 타임아웃 (이미지 생성을 위해 증가)
})

// 토큰 갱신 중인지 확인하는 플래그
let isRefreshing = false
// 갱신 대기 중인 요청들을 저장하는 배열
let refreshSubscribers = []

// 갱신 대기 중인 요청들을 처리하는 함수
const onRefreshed = (accessToken) => {
  refreshSubscribers.forEach((callback) => callback(accessToken))
  refreshSubscribers = []
}

// 갱신 대기 중인 요청을 추가하는 함수
const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback)
}

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

// 요청 인터셉터 - 지침에 따른 JWT 방식
api.interceptors.request.use(
  async (config) => {
    // 동적 import로 순환 참조 방지
    const { useAuthStore } = await import('@/stores/auth')
    const authStore = useAuthStore()

    // JWT 인증 관련 엔드포인트는 특별 처리
    const isAuthEndpoint = config.url?.includes('/auth/jwt/')

    // Access token이 있고 인증 엔드포인트가 아닌 경우 Authorization 헤더 추가
    if (authStore.accessToken && !isAuthEndpoint) {
      config.headers.Authorization = `Bearer ${authStore.accessToken}`
      console.log('🔑 [API][REQ] Authorization 헤더 추가:', config.url)
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

// 응답 인터셉터 - 지침에 따른 JWT 방식
api.interceptors.response.use(
  (response) => {
    // 성공 응답은 그대로 반환
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // 401 에러 처리
    if (error.response?.status === 401) {
      const isAuthEndpoint = originalRequest.url?.includes('/auth/jwt/')

      // 로그아웃 요청의 401은 정상적인 경우 (이미 로그아웃된 상태)
      if (originalRequest.url?.includes('/auth/jwt/logout/')) {
        console.log('ℹ️ [API][RES] 로그아웃 401 - 정상 처리')
        return Promise.reject(error)
      }

      // 토큰 갱신 요청의 401은 refresh token 만료
      if (originalRequest.url?.includes('/auth/jwt/refresh/')) {
        console.log(
          '🔒 [API][RES] Refresh token 만료 - 상태만 초기화 (리다이렉트는 라우터 가드에서 처리)',
        )
        // 동적 import로 순환 참조 방지
        const { useAuthStore } = await import('@/stores/auth')
        const authStore = useAuthStore()
        await authStore.resetAuth()

        // ⚠️ 강제 리다이렉트 제거 - 라우터 가드에서 처리하도록 함
        // 이렇게 하면 requiresAuth가 false인 페이지는 그대로 유지됨

        return Promise.reject(error)
      }

      // 일반 API 요청의 401 처리 (토큰 갱신 시도)
      if (!isAuthEndpoint && !originalRequest._retry) {
        originalRequest._retry = true

        if (isRefreshing) {
          // 이미 갱신 중이면 대기
          console.log('⏳ [API][RES] 토큰 갱신 대기 중...')
          return new Promise((resolve) => {
            addRefreshSubscriber((accessToken) => {
              if (accessToken) {
                originalRequest.headers.Authorization = `Bearer ${accessToken}`
                resolve(api(originalRequest))
              } else {
                resolve(Promise.reject(error))
              }
            })
          })
        }

        // 토큰 갱신 시도
        isRefreshing = true
        try {
          console.log('🔄 [API][RES] 401 에러 - 토큰 갱신 시도')
          // 동적 import로 순환 참조 방지
          const { useAuthStore } = await import('@/stores/auth')
          const authStore = useAuthStore()

          const success = await authStore.refreshToken()

          if (success && authStore.accessToken) {
            // 갱신 성공 - 원래 요청 재시도
            originalRequest.headers.Authorization = `Bearer ${authStore.accessToken}`
            onRefreshed(authStore.accessToken)
            console.log('✅ [API][RES] 토큰 갱신 성공 - 원래 요청 재시도')
            return api(originalRequest)
          } else {
            // 갱신 실패
            onRefreshed(null)
            console.log('❌ [API][RES] 토큰 갱신 실패 - 인증 상태 초기화')
          }
        } catch (refreshError) {
          onRefreshed(null)
          console.error('❌ [API][RES] 토큰 갱신 중 오류:', refreshError)
        } finally {
          isRefreshing = false
        }
      }
    }

    // 지침에 따른 전역 오류 처리 - Toast 시스템 활용
    if (error.response) {
      console.error('🚨 [API][RES] 서버 에러:', {
        status: error.response.status,
        url: originalRequest.url,
        data: error.response.data,
      })

      // 특정 엔드포인트는 Toast 표시 제외 (컴포넌트에서 직접 처리)
      const skipToastUrls = [
        '/auth/jwt/login/',
        '/auth/jwt/refresh/',
        '/auth/jwt/logout/',
        '/auth/auth/signup/',
        '/auth/auth/verify-email/',
      ]

      const shouldShowToast = !skipToastUrls.some((url) => originalRequest.url?.includes(url))

      if (shouldShowToast) {
        // 동적 import로 순환 참조 방지
        import('@/composables/useToast')
          .then(({ toast }) => {
            toast.showApiError(error)
          })
          .catch((err) => {
            console.error('❌ [API][RES] Toast 표시 실패:', err)
          })
      }
    } else if (error.request) {
      console.error('🌐 [API][RES] 네트워크 에러:', error.request)

      // 네트워크 오류는 항상 Toast로 표시
      import('@/composables/useToast')
        .then(({ toast }) => {
          toast.showNetworkError(error)
        })
        .catch((err) => {
          console.error('❌ [API][RES] Toast 표시 실패:', err)
        })
    } else {
      console.error('⚙️ [API][RES] 요청 설정 에러:', error.message)
    }

    return Promise.reject(error)
  },
)

export default api
