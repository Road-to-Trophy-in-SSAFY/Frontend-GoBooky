import { ref, computed } from 'vue'
import { booksAPI } from '@/api/books'
import { useApi } from '@/composables/useApi'

/**
 * 지침에 따른 도서 Composable
 * - 도서 관련 로직 캡슐화
 * - API 호출 및 상태 관리
 * - 캐시 및 필터링 지원
 */
export function useBooks() {
  const { execute, isLoading, error, clearError, reset } = useApi()

  // 상태
  const books = ref([])
  const selectedBook = ref(null)
  const categories = ref([])
  const selectedCategory = ref(null)

  // 계산된 속성
  const filteredBooks = computed(() => {
    if (!selectedCategory.value) {
      return books.value
    }
    return books.value.filter((book) => book.category_id === selectedCategory.value)
  })

  const hasBooks = computed(() => books.value.length > 0)

  /**
   * 도서 목록 조회
   * @param {Object} params 쿼리 파라미터
   * @returns {Promise} 도서 목록
   */
  const fetchBooks = async (params = {}) => {
    try {
      const response = await execute(() => booksAPI.getBooks(params))
      books.value = response.results || response
      return response
    } catch (err) {
      console.error('❌ [useBooks] 도서 목록 조회 실패:', err)
      throw err
    }
  }

  /**
   * 도서 상세 조회
   * @param {number} bookId 도서 ID
   * @returns {Promise} 도서 상세 정보
   */
  const fetchBook = async (bookId) => {
    try {
      const response = await execute(() => booksAPI.getBook(bookId))
      selectedBook.value = response
      return response
    } catch (err) {
      console.error('❌ [useBooks] 도서 상세 조회 실패:', err)
      throw err
    }
  }

  /**
   * 카테고리별 도서 조회
   * @param {string} categoryId 카테고리 ID
   * @returns {Promise} 도서 목록
   */
  const fetchBooksByCategory = async (categoryId) => {
    selectedCategory.value = categoryId
    return fetchBooks({ category: categoryId })
  }

  /**
   * 도서 검색
   * @param {string} query 검색어
   * @returns {Promise} 검색 결과
   */
  const searchBooks = async (query) => {
    try {
      const response = await execute(() => booksAPI.getBooks({ search: query }))
      books.value = response.results || response
      return response
    } catch (err) {
      console.error('❌ [useBooks] 도서 검색 실패:', err)
      throw err
    }
  }

  /**
   * 선택된 도서 설정
   * @param {Object} book 도서 객체
   */
  const setSelectedBook = (book) => {
    selectedBook.value = book
  }

  /**
   * 선택된 카테고리 설정
   * @param {string} categoryId 카테고리 ID
   */
  const setSelectedCategory = (categoryId) => {
    selectedCategory.value = categoryId
  }

  /**
   * 책 저장/해제 토글
   * @param {number} bookId 도서 ID
   * @returns {Promise} 토글 결과
   */
  const toggleBookSave = async (bookId) => {
    try {
      const response = await execute(() => booksAPI.toggleBookSave(bookId))

      // 현재 선택된 책이 토글된 책과 같다면 상태 업데이트
      if (selectedBook.value && selectedBook.value.id === bookId) {
        selectedBook.value.is_saved = response.is_saved
        selectedBook.value.saved_count = response.saved_count
      }

      return response
    } catch (err) {
      console.error('❌ [useBooks] 책 저장 토글 실패:', err)
      throw err
    }
  }

  /**
   * 상태 초기화
   */
  const resetBooks = () => {
    books.value = []
    selectedBook.value = null
    selectedCategory.value = null
    reset()
  }

  return {
    // 상태
    books,
    selectedBook,
    categories,
    selectedCategory,
    isLoading,
    error,

    // 계산된 속성
    filteredBooks,
    hasBooks,

    // 메서드
    fetchBooks,
    fetchBook,
    fetchBooksByCategory,
    searchBooks,
    toggleBookSave,
    setSelectedBook,
    setSelectedCategory,
    resetBooks,
    clearError,
  }
}

/**
 * 단일 도서 관리를 위한 Composable
 * @param {number} bookId 도서 ID
 * @returns {Object} 도서 관련 상태 및 메서드
 */
export function useBook(bookId) {
  const { execute, isLoading, error, clearError } = useApi()
  const book = ref(null)

  /**
   * 도서 정보 로드
   */
  const loadBook = async () => {
    if (!bookId) return

    try {
      const response = await execute(() => booksAPI.getBook(bookId))
      book.value = response
      return response
    } catch (err) {
      console.error('❌ [useBook] 도서 로드 실패:', err)
      throw err
    }
  }

  /**
   * 도서 정보 새로고침
   */
  const refreshBook = async () => {
    return loadBook()
  }

  return {
    // 상태
    book,
    isLoading,
    error,

    // 메서드
    loadBook,
    refreshBook,
    clearError,
  }
}
