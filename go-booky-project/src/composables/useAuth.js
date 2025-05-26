import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { authAPI } from '@/api/auth'

/**
 * 지침에 따른 인증 Composable
 * - 비즈니스 로직 캡슐화
 * - 스토어와 API 연결
 * - 에러 처리 및 로딩 상태 관리
 * - 로그아웃 시 모든 Pinia 스토어 초기화
 */
export function useAuth() {
  const router = useRouter()
  const authStore = useAuthStore()

  // 로딩 상태 관리
  const isLoading = ref(false)
  const error = ref(null)

  // 계산된 속성들
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const user = computed(() => authStore.user)
  const accessToken = computed(() => authStore.accessToken)

  /**
   * 에러 초기화
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * 모든 Pinia 스토어 초기화 (지침에 따른 전역 상태 초기화)
   */
  const resetAllStores = async () => {
    try {
      console.log('🔄 [useAuth] 모든 Pinia 스토어 초기화 시작')

      // 동적 import로 순환 참조 방지하면서 모든 스토어 가져오기
      const [{ useBookStore }, { useThreadStore }] = await Promise.all([
        import('@/stores/books'),
        import('@/stores/thread'),
      ])

      // 각 스토어의 reset 메서드 호출 (있는 경우에만)
      const bookStore = useBookStore()
      const threadStore = useThreadStore()

      // 스토어별 reset 메서드 호출
      if (typeof bookStore.reset === 'function') {
        bookStore.reset()
        console.log('✅ [useAuth] BookStore 초기화 완료')
      }

      if (typeof threadStore.reset === 'function') {
        threadStore.reset()
        console.log('✅ [useAuth] ThreadStore 초기화 완료')
      }

      // Auth 스토어는 마지막에 초기화
      authStore.resetAuth()
      console.log('✅ [useAuth] 모든 Pinia 스토어 초기화 완료')
    } catch (error) {
      console.error('❌ [useAuth] 스토어 초기화 중 오류:', error)
      // 오류가 발생해도 최소한 auth 스토어는 초기화
      authStore.resetAuth()
    }
  }

  /**
   * 로그인
   * @param {string} email 이메일
   * @param {string} password 비밀번호
   * @returns {Promise<boolean>} 성공 여부
   */
  const login = async (email, password) => {
    isLoading.value = true
    error.value = null

    try {
      console.log('🔐 [useAuth] 로그인 시도:', email)

      const response = await authAPI.login(email, password)

      // 스토어에 인증 정보 저장
      authStore.setAuth(response.access, response.user)

      console.log('✅ [useAuth] 로그인 성공:', response.user.email)
      return true
    } catch (err) {
      console.error('❌ [useAuth] 로그인 실패:', err)

      // 에러 메시지 설정
      if (err.response?.data?.detail) {
        error.value = err.response.data.detail
      } else if (err.response?.data?.non_field_errors) {
        error.value = err.response.data.non_field_errors[0]
      } else {
        error.value = '로그인 중 오류가 발생했습니다.'
      }

      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 로그아웃 (지침에 따른 모든 Pinia 스토어 초기화 포함)
   * @returns {Promise<boolean>} 성공 여부
   */
  const logout = async () => {
    isLoading.value = true
    error.value = null

    try {
      console.log('🚪 [useAuth] 로그아웃 시도')

      // 서버에 로그아웃 요청
      await authAPI.logout()

      // 지침에 따른 모든 Pinia 스토어 초기화
      await resetAllStores()

      console.log('✅ [useAuth] 로그아웃 성공')

      // 로그인 페이지로 리다이렉트
      router.push({ name: 'Login' })

      return true
    } catch (err) {
      console.error('❌ [useAuth] 로그아웃 실패:', err)

      // 로그아웃 실패해도 클라이언트 상태는 초기화
      await resetAllStores()

      error.value = '로그아웃 중 오류가 발생했습니다.'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 회원가입
   * @param {Object} userData 회원가입 데이터
   * @returns {Promise<boolean>} 성공 여부
   */
  const register = async (userData) => {
    isLoading.value = true
    error.value = null

    try {
      console.log('📝 [useAuth] 회원가입 시도:', userData.email)

      const response = await authAPI.register(userData)

      console.log('✅ [useAuth] 회원가입 성공:', response)
      return true
    } catch (err) {
      console.error('❌ [useAuth] 회원가입 실패:', err)

      // 에러 메시지 설정
      if (err.response?.data) {
        const errorData = err.response.data
        if (errorData.email) {
          error.value = errorData.email[0]
        } else if (errorData.password1) {
          error.value = errorData.password1[0]
        } else if (errorData.non_field_errors) {
          error.value = errorData.non_field_errors[0]
        } else {
          error.value = '회원가입 중 오류가 발생했습니다.'
        }
      } else {
        error.value = '회원가입 중 오류가 발생했습니다.'
      }

      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 이메일 인증
   * @param {string} uuid 인증 UUID
   * @returns {Promise<boolean>} 성공 여부
   */
  const verifyEmail = async (uuid) => {
    isLoading.value = true
    error.value = null

    try {
      console.log('📧 [useAuth] 이메일 인증 시도:', uuid)

      const response = await authAPI.verifyEmail(uuid)

      console.log('✅ [useAuth] 이메일 인증 성공:', response)
      return true
    } catch (err) {
      console.error('❌ [useAuth] 이메일 인증 실패:', err)

      // 에러 메시지 설정
      if (err.response?.data?.detail) {
        error.value = err.response.data.detail
      } else {
        error.value = '이메일 인증 중 오류가 발생했습니다.'
      }

      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    isLoading,
    error,

    // Computed
    isAuthenticated,
    user,
    accessToken,

    // Actions
    login,
    logout,
    register,
    verifyEmail,
    clearError,
  }
}
