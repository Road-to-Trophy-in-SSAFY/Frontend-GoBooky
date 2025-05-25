import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { categoriesData } from './categoriesData.js'

/**
 * 지침에 따른 단순화된 도서 스토어
 * - 상태 관리만 담당
 * - 비즈니스 로직은 useBooks composable로 분리
 * - 캐시 및 필터링 관리
 */
export const useBookStore = defineStore(
  'book',
  () => {
    // === State ===
    const books = ref([])
    const bookDetail = ref(null)
    const categories = ref(categoriesData)
    const filters = ref({
      category: null,
      search: '',
      sortBy: 'title',
      sortOrder: 'asc',
    })
    const pagination = ref({
      page: 1,
      totalPages: 1,
      totalCount: 0,
      hasNext: false,
      hasPrevious: false,
    })

    // === Getters ===
    const hasBooks = computed(() => books.value.length > 0)

    const getBookById = computed(() => {
      return (id) => books.value.find((book) => book.id === parseInt(id))
    })

    const filteredBooks = computed(() => {
      let result = books.value

      // 카테고리 필터
      if (filters.value.category) {
        result = result.filter((book) => {
          // 직접 category_id로 비교
          if (book.category_id) {
            return book.category_id === filters.value.category
          }
          // category_name으로 비교 (레거시 지원)
          if (book.category_name) {
            return getCategoryPkByName(book.category_name) === filters.value.category
          }
          return false
        })
      }

      // 검색 필터
      if (filters.value.search) {
        const searchTerm = filters.value.search.toLowerCase()
        result = result.filter(
          (book) =>
            book.title.toLowerCase().includes(searchTerm) ||
            book.author.toLowerCase().includes(searchTerm) ||
            book.description?.toLowerCase().includes(searchTerm),
        )
      }

      // 정렬
      result.sort((a, b) => {
        const { sortBy, sortOrder } = filters.value
        let aValue = a[sortBy]
        let bValue = b[sortBy]

        // 문자열 비교
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase()
          bValue = bValue.toLowerCase()
        }

        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1
        } else {
          return aValue < bValue ? 1 : -1
        }
      })

      return result
    })

    const getCategoryById = computed(() => {
      return (id) => categories.value.find((cat) => cat.pk === id)
    })

    const getCategoryByName = computed(() => {
      return (name) => categories.value.find((cat) => cat.fields.name === name)
    })

    // === Actions (상태 변경만) ===

    /**
     * 도서 목록 설정
     * @param {Array} bookList 도서 목록
     */
    function setBooks(bookList) {
      books.value = bookList
      console.log('✅ [BookStore] 도서 목록 설정 완료:', bookList.length)
    }

    /**
     * 도서 상세 설정
     * @param {Object} book 도서 객체
     */
    function setBookDetail(book) {
      bookDetail.value = book
      console.log('✅ [BookStore] 도서 상세 설정 완료:', book?.id)
    }

    /**
     * 카테고리 목록 설정
     * @param {Array} categoryList 카테고리 목록
     */
    function setCategories(categoryList) {
      categories.value = categoryList
      console.log('✅ [BookStore] 카테고리 목록 설정 완료:', categoryList.length)
    }

    /**
     * 필터 설정
     * @param {Object} filterData 필터 데이터
     */
    function setFilters(filterData) {
      filters.value = { ...filters.value, ...filterData }
    }

    /**
     * 페이지네이션 정보 설정
     * @param {Object} paginationData 페이지네이션 데이터
     */
    function setPagination(paginationData) {
      pagination.value = { ...pagination.value, ...paginationData }
    }

    /**
     * 카테고리 이름으로 PK 찾기 (레거시 지원)
     * @param {string} name 카테고리 이름
     * @returns {number|null} 카테고리 PK
     */
    function getCategoryPkByName(name) {
      const category = categories.value.find((cat) => cat.fields.name === name)
      return category ? category.pk : null
    }

    /**
     * 상태 초기화
     */
    function reset() {
      books.value = []
      bookDetail.value = null
      filters.value = {
        category: null,
        search: '',
        sortBy: 'title',
        sortOrder: 'asc',
      }
      pagination.value = {
        page: 1,
        totalPages: 1,
        totalCount: 0,
        hasNext: false,
        hasPrevious: false,
      }
      console.log('🔄 [BookStore] 상태 초기화 완료')
    }

    return {
      // State
      books,
      bookDetail,
      categories,
      filters,
      pagination,

      // Getters
      hasBooks,
      getBookById,
      filteredBooks,
      getCategoryById,
      getCategoryByName,

      // Actions
      setBooks,
      setBookDetail,
      setCategories,
      setFilters,
      setPagination,
      getCategoryPkByName,
      reset,
    }
  },
  {
    // 지침에 따른 persist 설정
    persist: {
      key: 'gobooky-books',
      storage: sessionStorage, // 세션 스토리지 사용
      paths: ['filters'], // 필터 설정만 유지
    },
  },
)
