import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * 지침에 따른 단순화된 인증 스토어
 * - 상태 관리만 담당
 * - 비즈니스 로직은 useAuth composable로 분리
 * - Access token: 메모리에만 저장 (XSS 방지)
 * - Refresh token: HttpOnly 쿠키로 자동 관리 (CSRF 방지)
 */
export const useAuthStore = defineStore('auth', () => {
  // === State ===
  const user = ref(null)
  const accessToken = ref(null)

  // 기존 Local Storage 데이터 정리 (한 번만 실행)
  if (typeof window !== 'undefined' && localStorage.getItem('gobooky-auth')) {
    console.log('🧹 [AuthStore] 기존 Local Storage 데이터 정리')
    localStorage.removeItem('gobooky-auth')
  }

  // === Getters ===
  const isAuthenticated = computed(() => {
    return Boolean(user.value && accessToken.value)
  })

  const userProfile = computed(() => {
    return user.value
      ? {
          id: user.value.id,
          email: user.value.email,
          username: user.value.username,
          firstName: user.value.first_name,
          lastName: user.value.last_name,
          fullName: `${user.value.first_name} ${user.value.last_name}`.trim(),
          nickname: user.value.nickname,
          avatar: user.value.avatar,
          categories: user.value.categories || [],
          followersCount: user.value.followers_count || 0,
          followingCount: user.value.following_count || 0,
          isProfileComplete: user.value.is_profile_complete || false,
        }
      : null
  })

  const hasValidToken = computed(() => {
    return Boolean(accessToken.value)
  })

  // === Actions (상태 변경만) ===

  /**
   * 인증 정보 설정
   * @param {string} token Access token
   * @param {Object} userData 사용자 데이터
   */
  function setAuth(token, userData) {
    accessToken.value = token
    user.value = userData
    console.log('✅ [AuthStore] 인증 정보 설정 완료:', userData.email)
  }

  /**
   * 인증 상태 초기화
   */
  function resetAuth() {
    user.value = null
    accessToken.value = null
    console.log('🔄 [AuthStore] 인증 상태 초기화 완료')
  }

  /**
   * 사용자 정보 업데이트
   * @param {Object} userData 업데이트할 사용자 데이터
   */
  function updateUser(userData) {
    if (user.value) {
      user.value = { ...user.value, ...userData }
      console.log('✅ [AuthStore] 사용자 정보 업데이트 완료')
    }
  }

  /**
   * Access token만 업데이트 (토큰 갱신 시)
   * @param {string} token 새로운 Access token
   */
  function updateToken(token) {
    accessToken.value = token
    console.log('✅ [AuthStore] Access token 업데이트 완료')
  }

  /**
   * 사용자 프로필 완성 상태 업데이트
   * @param {boolean} isComplete 완성 여부
   */
  function setProfileComplete(isComplete) {
    if (user.value) {
      user.value.is_profile_complete = isComplete
      console.log('✅ [AuthStore] 프로필 완성 상태 업데이트:', isComplete)
    }
  }

  /**
   * 쿠키 존재 여부 확인 (HttpOnly 쿠키는 직접 읽을 수 없으므로 API 호출로 확인)
   * @param {string} cookieName 쿠키 이름
   * @returns {boolean} 쿠키 존재 여부 (추정)
   */
  function hasCookie(cookieName) {
    if (typeof document === 'undefined') return false
    // HttpOnly 쿠키는 JavaScript에서 읽을 수 없으므로
    // 일반 쿠키만 확인하고, 실제 존재 여부는 API 호출로 검증
    return document.cookie.split(';').some((cookie) => cookie.trim().startsWith(cookieName + '='))
  }

  /**
   * 앱 초기화 시 인증 상태 확인
   * @returns {Promise<boolean>} 인증 성공 여부
   */
  async function initAuth() {
    try {
      console.log('🔍 [AuthStore] 인증 상태 초기화 시작')

      // 이미 access token이 있으면 인증된 상태
      if (accessToken.value) {
        console.log('✅ [AuthStore] 기존 토큰 존재 - 인증됨')
        return true
      }

      // 첫 접속인지 확인 (sessionStorage 활용)
      const hasVisited = sessionStorage.getItem('gobooky-visited')

      if (!hasVisited) {
        // 첫 접속 - API 호출 없이 게스트 모드
        console.log('👤 [AuthStore] 첫 접속 - 게스트 모드')
        sessionStorage.setItem('gobooky-visited', 'true')
        return false
      }

      // 재방문 (새로고침 등) - silent refresh 시도
      console.log('🔄 [AuthStore] 재방문 감지 - Silent refresh 시도')

      const success = await silentRefresh()
      if (success) {
        console.log('✅ [AuthStore] 토큰 갱신으로 인증 복구')
        return true
      } else {
        console.log('👤 [AuthStore] Refresh token 없음/만료 - 게스트 모드')
        return false
      }
    } catch (error) {
      console.error('❌ [AuthStore] 인증 상태 초기화 실패:', error)
      resetAuth()
      return false
    }
  }

  /**
   * Silent refresh - 조용한 토큰 갱신 (초기화 시 사용)
   * @returns {Promise<boolean>} 성공 여부
   */
  async function silentRefresh() {
    try {
      // 동적 import로 순환 참조 방지
      const { authAPI } = await import('@/api/auth')
      const response = await authAPI.refreshToken()

      // 새 토큰과 사용자 정보 저장
      setAuth(response.access, response.user)
      return true
    } catch (error) {
      // Silent refresh는 실패해도 에러 로그를 출력하지 않음
      // 401 에러는 정상적인 상황 (쿠키 없음 또는 만료)
      if (error.response?.status !== 401) {
        console.error('❌ [AuthStore] Silent refresh 예상치 못한 오류:', error)
      }
      resetAuth()
      return false
    }
  }

  /**
   * 토큰 갱신 (명시적 호출 시 사용)
   * @returns {Promise<boolean>} 성공 여부
   */
  async function refreshToken() {
    try {
      console.log('🔄 [AuthStore] 토큰 갱신 시도')

      // 동적 import로 순환 참조 방지
      const { authAPI } = await import('@/api/auth')
      const response = await authAPI.refreshToken()

      console.log('🔍 [AuthStore] 토큰 갱신 응답:', response)

      // 새 토큰과 사용자 정보 저장
      setAuth(response.access, response.user)

      console.log('✅ [AuthStore] 토큰 갱신 성공')
      return true
    } catch (error) {
      console.error('❌ [AuthStore] 토큰 갱신 실패:', error)
      console.error('❌ [AuthStore] 에러 상세:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      })
      resetAuth()
      return false
    }
  }

  return {
    // State
    user,
    accessToken,

    // Getters
    isAuthenticated,
    userProfile,
    hasValidToken,

    // Actions
    setAuth,
    resetAuth,
    updateUser,
    updateToken,
    setProfileComplete,
    initAuth,
    silentRefresh,
    refreshToken,
    hasCookie,
  }
})
// 지침에 따라 persist 설정 완전 제거
// Access Token은 메모리에만 저장 (XSS 방지)
// Refresh Token은 HttpOnly 쿠키로 자동 관리 (CSRF 방지)
