import api from './index'

/**
 * 지침에 따른 인증 API 서비스
 * - JWT 로그인/로그아웃/갱신
 * - 회원가입/이메일 인증
 * - 프로필 관리
 */
export const authAPI = {
  // === JWT 인증 ===

  /**
   * JWT 로그인
   * @param {string} email
   * @param {string} password
   * @returns {Promise} 로그인 응답
   */
  async login(email, password) {
    const response = await api.post('/auth/auth/jwt/login/', {
      email,
      password,
    })
    return response.data
  },

  /**
   * JWT 토큰 갱신
   * @returns {Promise} 갱신 응답
   */
  async refreshToken() {
    const response = await api.post('/auth/auth/jwt/refresh/')
    return response.data
  },

  /**
   * JWT 로그아웃
   * @returns {Promise} 로그아웃 응답
   */
  async logout() {
    const response = await api.post('/auth/auth/jwt/logout/')
    return response.data
  },

  // === 회원가입 및 인증 ===

  /**
   * 회원가입
   * @param {Object} userData 회원가입 데이터
   * @returns {Promise} 회원가입 응답
   */
  async register(userData) {
    const response = await api.post('/auth/auth/register/', userData)
    return response.data
  },

  /**
   * 이메일 인증 (POST - 인증 상태 확인)
   * @param {string} uuid 인증 UUID
   * @returns {Promise} 인증 응답
   */
  async verifyEmail(uuid) {
    const response = await api.post(`/auth/auth/register/verify/`, { uuid })
    return response.data
  },

  /**
   * 이메일 인증 링크 처리 (GET - 실제 인증 처리)
   * @param {string} uuid 인증 UUID
   * @returns {Promise} 인증 응답
   */
  async verifyEmailByUUID(uuid) {
    const response = await api.get(`/auth/auth/verify-email/${uuid}/`)
    return response.data
  },

  /**
   * 이메일 재전송
   * @param {string} email 이메일 주소
   * @returns {Promise} 재전송 응답
   */
  async resendEmail(email) {
    const response = await api.post('/auth/auth/resend-email/', { email })
    return response.data
  },

  // === 프로필 관리 ===

  /**
   * 프로필 완성
   * @param {Object} profileData 프로필 데이터
   * @returns {Promise} 프로필 완성 응답
   */
  async completeProfile(profileData) {
    const response = await api.post('/auth/auth/register/complete/', profileData)
    return response.data
  },

  /**
   * 회원가입 완료
   * @param {Object} registrationData 회원가입 완료 데이터
   * @returns {Promise} 회원가입 완료 응답
   */
  async completeRegistration(registrationData) {
    const response = await api.patch('/auth/auth/register/complete/', registrationData)
    return response.data
  },

  /**
   * 프로필 조회
   * @param {string} username 사용자명
   * @returns {Promise} 프로필 데이터
   */
  async getProfile(username) {
    const response = await api.get(`/auth/auth/profile/${username}/`)
    return response.data
  },

  /**
   * 계정 삭제
   * @param {Object} data 삭제 요청 데이터 (비밀번호 포함)
   * @returns {Promise} 삭제 응답
   */
  async deleteAccount(data) {
    const response = await api.delete('/auth/auth/account/', { data })
    return response.data
  },

  // === 팔로우 관리 ===

  /**
   * 팔로우/언팔로우 토글
   * @param {string} username 대상 사용자명
   * @returns {Promise} 팔로우 상태
   */
  async toggleFollow(username) {
    const response = await api.post(`/auth/auth/profile/${username}/follow/`)
    return response.data
  },

  // === 기타 ===

  /**
   * 닉네임 중복 확인
   * @param {Object} data 닉네임 데이터
   * @returns {Promise} 중복 확인 결과
   */
  async checkNickname(data) {
    const response = await api.post('/auth/auth/check-nickname/', data)
    return response.data
  },

  /**
   * 카테고리 목록 조회
   * @returns {Promise} 카테고리 목록
   */
  async getCategories() {
    const response = await api.get('/auth/auth/categories/')
    return response.data
  },
}
