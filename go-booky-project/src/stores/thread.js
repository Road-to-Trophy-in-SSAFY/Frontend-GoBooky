import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

/**
 * 지침에 따른 단순화된 쓰레드 스토어
 * - 상태 관리만 담당
 * - 비즈니스 로직은 useThreads composable로 분리
 * - 캐시 및 상태 동기화 관리
 */
export const useThreadStore = defineStore(
  'thread',
  () => {
    // === State ===
    const threads = ref([])
    const threadDetail = ref(null)
    const pagination = ref({
      page: 1,
      totalPages: 1,
      totalCount: 0,
      hasNext: false,
      hasPrevious: false,
    })
    const filters = ref({
      category: null,
      search: '',
      sortBy: 'created_at',
      sortOrder: 'desc',
    })

    // === Getters ===
    const hasThreads = computed(() => threads.value.length > 0)

    const getThreadById = computed(() => {
      return (id) => threads.value.find((thread) => thread.id === parseInt(id))
    })

    const filteredThreads = computed(() => {
      let result = threads.value

      // 카테고리 필터
      if (filters.value.category) {
        result = result.filter((thread) => thread.book?.category_id === filters.value.category)
      }

      // 검색 필터
      if (filters.value.search) {
        const searchTerm = filters.value.search.toLowerCase()
        result = result.filter(
          (thread) =>
            thread.title.toLowerCase().includes(searchTerm) ||
            thread.content.toLowerCase().includes(searchTerm) ||
            thread.book?.title.toLowerCase().includes(searchTerm),
        )
      }

      return result
    })

    // === Actions (상태 변경만) ===

    /**
     * 쓰레드 목록 설정
     * @param {Array} threadList 쓰레드 목록
     */
    function setThreads(threadList) {
      threads.value = threadList
      console.log('✅ [ThreadStore] 쓰레드 목록 설정 완료:', threadList.length)
    }

    /**
     * 쓰레드 상세 설정
     * @param {Object} thread 쓰레드 객체
     */
    function setThreadDetail(thread) {
      threadDetail.value = thread
      console.log('✅ [ThreadStore] 쓰레드 상세 설정 완료:', thread?.id)
    }

    /**
     * 페이지네이션 정보 설정
     * @param {Object} paginationData 페이지네이션 데이터
     */
    function setPagination(paginationData) {
      pagination.value = { ...pagination.value, ...paginationData }
    }

    /**
     * 필터 설정
     * @param {Object} filterData 필터 데이터
     */
    function setFilters(filterData) {
      filters.value = { ...filters.value, ...filterData }
    }

    /**
     * 쓰레드 추가 (목록 맨 앞에)
     * @param {Object} thread 새 쓰레드
     */
    function addThread(thread) {
      threads.value.unshift(thread)
      console.log('✅ [ThreadStore] 쓰레드 추가 완료:', thread.id)
    }

    /**
     * 쓰레드 업데이트
     * @param {number} threadId 쓰레드 ID
     * @param {Object} updatedThread 업데이트된 쓰레드 데이터
     */
    function updateThread(threadId, updatedThread) {
      const index = threads.value.findIndex((thread) => thread.id === threadId)
      if (index !== -1) {
        threads.value[index] = updatedThread
      }

      // 상세 페이지 데이터도 업데이트
      if (threadDetail.value?.id === threadId) {
        threadDetail.value = updatedThread
      }

      console.log('✅ [ThreadStore] 쓰레드 업데이트 완료:', threadId)
    }

    /**
     * 쓰레드 삭제
     * @param {number} threadId 쓰레드 ID
     */
    function removeThread(threadId) {
      threads.value = threads.value.filter((thread) => thread.id !== threadId)

      // 상세 페이지 데이터도 초기화
      if (threadDetail.value?.id === threadId) {
        threadDetail.value = null
      }

      console.log('✅ [ThreadStore] 쓰레드 삭제 완료:', threadId)
    }

    /**
     * 쓰레드 좋아요 상태 업데이트
     * @param {number} threadId 쓰레드 ID
     * @param {boolean} liked 좋아요 상태
     * @param {number} likesCount 좋아요 수
     */
    function updateThreadLike(threadId, liked, likesCount) {
      // 목록에서 업데이트
      const threadIndex = threads.value.findIndex((thread) => thread.id === threadId)
      if (threadIndex !== -1) {
        threads.value[threadIndex].liked = liked
        threads.value[threadIndex].likes_count = likesCount
      }

      // 상세 페이지에서도 업데이트
      if (threadDetail.value?.id === threadId) {
        threadDetail.value.liked = liked
        threadDetail.value.likes_count = likesCount
      }

      console.log('✅ [ThreadStore] 쓰레드 좋아요 상태 업데이트:', threadId, liked)
    }

    /**
     * 상태 초기화
     */
    function reset() {
      threads.value = []
      threadDetail.value = null
      pagination.value = {
        page: 1,
        totalPages: 1,
        totalCount: 0,
        hasNext: false,
        hasPrevious: false,
      }
      filters.value = {
        category: null,
        search: '',
        sortBy: 'created_at',
        sortOrder: 'desc',
      }
      console.log('🔄 [ThreadStore] 상태 초기화 완료')
    }

    return {
      // State
      threads,
      threadDetail,
      pagination,
      filters,

      // Getters
      hasThreads,
      getThreadById,
      filteredThreads,

      // Actions
      setThreads,
      setThreadDetail,
      setPagination,
      setFilters,
      addThread,
      updateThread,
      removeThread,
      updateThreadLike,
      reset,
    }
  },
  {
    // 지침에 따른 persist 설정
    persist: {
      key: 'gobooky-threads',
      storage: sessionStorage, // 세션 스토리지 사용 (탭 닫으면 초기화)
      paths: ['filters'], // 필터 설정만 유지
    },
  },
)
