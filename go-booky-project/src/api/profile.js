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
    const response = await api.get(`/auth/auth/profile/${username}/books/`, { params })
    return response.data
  },

  /**
   * 도서 저장/저장 해제
   * @param {number} bookId 도서 ID
   * @returns {Promise} 저장 상태
   */
  async toggleBookSave(bookId) {
    const response = await api.post(`/auth/auth/books/${bookId}/save/`)
    return response.data
  },

  /**
   * 사용자의 댓글 목록 조회
   * @param {string} username 사용자명
   * @param {Object} params 쿼리 파라미터 (page, limit 등)
   * @returns {Promise} 댓글 목록
   */
  async getUserComments(username, params = {}) {
    const response = await api.get(`/auth/auth/profile/${username}/comments/`, { params })
    return response.data
  },

  /**
   * 사용자의 쓰레드 목록 조회
   * @param {string} username 사용자명
   * @param {Object} params 쿼리 파라미터 (page, limit 등)
   * @returns {Promise} 쓰레드 목록
   */
  async getUserThreads(username, params = {}) {
    const response = await api.get(`/auth/auth/profile/${username}/threads/`, { params })
    return response.data
  },

  /**
   * 댓글 삭제
   * @param {number} threadId 쓰레드 ID
   * @param {number} commentId 댓글 ID
   * @returns {Promise} 삭제 결과
   */
  async deleteComment(threadId, commentId) {
    const response = await api.delete(`/api/threads/${threadId}/comments/${commentId}/`)
    return response.data
  },

  /**
   * 대댓글 삭제
   * @param {number} threadId 쓰레드 ID
   * @param {number} commentId 댓글 ID
   * @param {number} replyId 대댓글 ID
   * @returns {Promise} 삭제 결과
   */
  async deleteReply(threadId, commentId, replyId) {
    const response = await api.delete(
      `/api/threads/${threadId}/comments/${commentId}/replies/${replyId}/`,
    )
    return response.data
  },

  /**
   * 쓰레드 삭제
   * @param {number} threadId 쓰레드 ID
   * @returns {Promise} 삭제 결과
   */
  async deleteThread(threadId) {
    const response = await api.delete(`/api/threads/${threadId}/`)
    return response.data
  },
}
