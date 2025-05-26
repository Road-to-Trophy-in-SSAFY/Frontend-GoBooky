import api from '@/api/index'

/**
 * 프로필 관련 API 서비스
 * - 사용자 활동 데이터 조회
 * - 나의 책, 댓글, 쓰레드 관리
 */
export const profileAPI = {
  // === 사용자 활동 데이터 ===

  /**
   * 사용자의 저장된 도서 목록 조회
   * @param {string} username 사용자명
   * @param {Object} params 쿼리 파라미터 (page, limit 등)
   * @returns {Promise} 저장된 도서 목록
   */
  async getUserBooks(username, params = {}) {
    try {
      const response = await api.get(`/auth/auth/profile/${username}/books/`, { params })
      return response.data
    } catch (error) {
      console.warn('❌ 사용자 도서 API 미구현 - 빈 데이터 반환')
      // API가 구현되지 않은 경우 빈 데이터 반환
      return {
        results: [],
        count: 0,
        next: null,
        previous: null,
      }
    }
  },

  /**
   * 도서 저장/저장 해제
   * @param {number} bookId 도서 ID
   * @returns {Promise} 저장 상태
   */
  async toggleBookSave(bookId) {
    const response = await api.post(`/books/books/${bookId}/save/`)
    return response.data
  },

  /**
   * 사용자의 댓글 목록 조회
   * @param {string} username 사용자명
   * @param {Object} params 쿼리 파라미터 (page, limit 등)
   * @returns {Promise} 댓글 목록
   */
  async getUserComments(username, params = {}) {
    try {
      const response = await api.get(`/auth/auth/profile/${username}/comments/`, { params })
      return response.data
    } catch (error) {
      console.warn('❌ 사용자 댓글 API 미구현 - 빈 데이터 반환')
      return {
        results: [],
        count: 0,
        next: null,
        previous: null,
      }
    }
  },

  /**
   * 사용자의 쓰레드 목록 조회
   * @param {string} username 사용자명
   * @param {Object} params 쿼리 파라미터 (page, limit 등)
   * @returns {Promise} 쓰레드 목록
   */
  async getUserThreads(username, params = {}) {
    try {
      const response = await api.get(`/auth/auth/profile/${username}/threads/`, { params })
      return response.data
    } catch (error) {
      console.warn('❌ 사용자 쓰레드 API 미구현 - 빈 데이터 반환')
      return {
        results: [],
        count: 0,
        next: null,
        previous: null,
      }
    }
  },

  /**
   * 댓글 삭제
   * @param {number} commentId 댓글 ID
   * @returns {Promise} 삭제 결과
   */
  async deleteComment(commentId) {
    const response = await api.delete(`/threads/comments/${commentId}/`)
    return response.data
  },

  /**
   * 대댓글 삭제
   * @param {number} replyId 대댓글 ID
   * @returns {Promise} 삭제 결과
   */
  async deleteReply(replyId) {
    const response = await api.delete(`/threads/replies/${replyId}/`)
    return response.data
  },

  /**
   * 쓰레드 삭제
   * @param {number} threadId 쓰레드 ID
   * @returns {Promise} 삭제 결과
   */
  async deleteThread(threadId) {
    const response = await api.delete(`/threads/threads/${threadId}/`)
    return response.data
  },
}
