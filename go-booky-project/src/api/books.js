import api from '@/api/index'

/**
 * 지침에 따른 도서 API 서비스
 * - ViewSet 기반 RESTful API
 * - 도서 목록/상세 조회
 * - 카테고리 필터링
 */
export const booksAPI = {
  // === 도서 관리 ===

  /**
   * 도서 목록 조회 (ViewSet 기반)
   * @param {Object} params 쿼리 파라미터
   * @param {string} params.category 카테고리 ID
   * @param {number} params.page 페이지 번호
   * @returns {Promise} 도서 목록
   */
  async getBooks(params = {}) {
    const response = await api.get('/api/books/', { params })
    return response.data
  },

  /**
   * 도서 상세 조회 (ViewSet 기반)
   * @param {number} bookId 도서 ID
   * @returns {Promise} 도서 상세 정보
   */
  async getBook(bookId) {
    const response = await api.get(`/api/books/${bookId}/`)
    return response.data
  },

  /**
   * 책 저장/해제 토글
   * @param {number} bookId 도서 ID
   * @returns {Promise} 토글 결과
   */
  async toggleBookSave(bookId) {
    const response = await api.post(`/auth/auth/books/${bookId}/save/`)
    return response.data
  },

  // === 레거시 호환성 (기존 프론트엔드용) ===

  /**
   * 도서 목록 조회 (레거시)
   * @param {string} category 카테고리 ID
   * @returns {Promise} 도서 목록
   */
  async getBooksLegacy(category = null) {
    const params = category ? { category } : {}
    const response = await api.get('/legacy/books/', { params })
    return response.data
  },

  /**
   * 도서 상세 조회 (레거시)
   * @param {number} bookId 도서 ID
   * @returns {Promise} 도서 상세 정보
   */
  async getBookLegacy(bookId) {
    const response = await api.get(`/legacy/books/${bookId}/`)
    return response.data
  },
}
