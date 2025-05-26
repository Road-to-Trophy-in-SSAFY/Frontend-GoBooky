import api from '@/api/index'

/**
 * 지침에 따른 쓰레드 API 서비스
 * - ViewSet 기반 RESTful API
 * - CRUD 전체 지원
 * - 좋아요 기능
 */
export const threadsAPI = {
  // === 쓰레드 관리 (ViewSet 기반) ===

  /**
   * 쓰레드 목록 조회
   * @param {Object} params 쿼리 파라미터
   * @param {number} params.page 페이지 번호
   * @returns {Promise} 쓰레드 목록
   */
  async getThreads(params = {}) {
    const response = await api.get('/api/threads/', { params })
    return response.data
  },

  /**
   * 쓰레드 상세 조회
   * @param {number} threadId 쓰레드 ID
   * @returns {Promise} 쓰레드 상세 정보
   */
  async getThread(threadId) {
    const response = await api.get(`/api/threads/${threadId}/`)
    return response.data
  },

  /**
   * 쓰레드 생성
   * @param {Object} threadData 쓰레드 데이터
   * @param {number} threadData.book 도서 ID
   * @param {string} threadData.title 제목
   * @param {string} threadData.content 내용
   * @param {string} threadData.reading_date 읽은 날짜
   * @returns {Promise} 생성된 쓰레드
   */
  async createThread(threadData) {
    const response = await api.post('/api/threads/', threadData)
    return response.data
  },

  /**
   * 쓰레드 수정
   * @param {number} threadId 쓰레드 ID
   * @param {Object} threadData 수정할 데이터
   * @returns {Promise} 수정된 쓰레드
   */
  async updateThread(threadId, threadData) {
    const response = await api.put(`/api/threads/${threadId}/`, threadData)
    return response.data
  },

  /**
   * 쓰레드 부분 수정
   * @param {number} threadId 쓰레드 ID
   * @param {Object} threadData 수정할 데이터
   * @returns {Promise} 수정된 쓰레드
   */
  async patchThread(threadId, threadData) {
    const response = await api.patch(`/api/threads/${threadId}/`, threadData)
    return response.data
  },

  /**
   * 쓰레드 삭제
   * @param {number} threadId 쓰레드 ID
   * @returns {Promise} 삭제 응답
   */
  async deleteThread(threadId) {
    const response = await api.delete(`/api/threads/${threadId}/`)
    return response.data
  },

  /**
   * 쓰레드 좋아요/좋아요 취소
   * @param {number} threadId 쓰레드 ID
   * @returns {Promise} 좋아요 상태
   */
  async toggleLike(threadId) {
    const response = await api.post(`/api/threads/${threadId}/like/`)
    return response.data
  },

  // === 레거시 호환성 (기존 프론트엔드용) ===

  /**
   * 쓰레드 목록 조회 (레거시)
   * @returns {Promise} 쓰레드 목록
   */
  async getThreadsLegacy() {
    const response = await api.get('/threads/')
    return response.data
  },

  /**
   * 쓰레드 상세 조회 (레거시)
   * @param {number} threadId 쓰레드 ID
   * @returns {Promise} 쓰레드 상세 정보
   */
  async getThreadLegacy(threadId) {
    const response = await api.get(`/threads/${threadId}/`)
    return response.data
  },

  /**
   * 쓰레드 생성 (레거시)
   * @param {Object} threadData 쓰레드 데이터
   * @returns {Promise} 생성된 쓰레드
   */
  async createThreadLegacy(threadData) {
    const response = await api.post('/threads/', threadData)
    return response.data
  },

  /**
   * 쓰레드 수정 (레거시)
   * @param {number} threadId 쓰레드 ID
   * @param {Object} threadData 수정할 데이터
   * @returns {Promise} 수정된 쓰레드
   */
  async updateThreadLegacy(threadId, threadData) {
    const response = await api.put(`/threads/${threadId}/`, threadData)
    return response.data
  },

  /**
   * 쓰레드 삭제 (레거시)
   * @param {number} threadId 쓰레드 ID
   * @returns {Promise} 삭제 응답
   */
  async deleteThreadLegacy(threadId) {
    const response = await api.delete(`/threads/${threadId}/`)
    return response.data
  },

  /**
   * 쓰레드 좋아요/좋아요 취소 (레거시)
   * @param {number} threadId 쓰레드 ID
   * @returns {Promise} 좋아요 상태
   */
  async toggleLikeLegacy(threadId) {
    const response = await api.post(`/threads/${threadId}/like/`)
    return response.data
  },
}
