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
   * 인기 쓰레드 조회 (좋아요 순)
   * @param {number} count 조회할 쓰레드 개수 (기본값: 3)
   * @returns {Promise} 인기 쓰레드 목록
   */
  async getPopularThreads(count = 3) {
    const response = await api.get('/api/threads/popular/', { params: { count } })
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

  /**
   * 여러 쓰레드의 좋아요 상태 조회 (실시간)
   * @param {Array<number>} threadIds 쓰레드 ID 배열
   * @returns {Promise} 좋아요 상태 맵 { threadId: { liked: boolean, likes_count: number } }
   */
  async getLikeStatus(threadIds) {
    if (!threadIds || threadIds.length === 0) {
      return {}
    }
    const response = await api.get('/api/threads/like_status/', {
      params: { thread_ids: threadIds.join(',') },
    })
    return response.data
  },
}
