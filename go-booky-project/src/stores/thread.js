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
    const threadsMap = ref(new Map()) // ID를 키로 하는 Map으로 변경
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
    const threads = computed(() => Array.from(threadsMap.value.values()))

    const getThreadById = computed(() => {
      return (id) => {
        const numericId = parseInt(id)
        return threadsMap.value.get(numericId) || null
      }
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
    function setThreads(threadList, append = false) {
      if (append) {
        // 무한 스크롤: 기존 데이터에 추가
        threadList.forEach((thread) => {
          if (!threadsMap.value.has(thread.id)) {
            threadsMap.value.set(thread.id, thread)
          }
        })
      } else {
        // 새로운 데이터로 교체
        const newThreadsMap = new Map()
        threadList.forEach((thread) => {
          newThreadsMap.set(thread.id, thread)
        })
        threadsMap.value = newThreadsMap
      }
      console.log(
        '✅ [ThreadStore] 쓰레드 목록 설정:',
        threadList.length,
        append ? '(추가)' : '(교체)',
      )
    }

    /**
     * 쓰레드 상세 설정
     * @param {Object} thread 쓰레드 객체
     */
    function setThreadDetail(thread) {
      if (!thread) {
        threadDetail.value = null
        return
      }

      // 상세 정보 업데이트
      threadDetail.value = thread

      // 목록에도 동일한 쓰레드가 있다면 함께 업데이트
      if (threadsMap.value.has(thread.id)) {
        threadsMap.value.set(thread.id, { ...thread })
      }

      console.log('✅ [ThreadStore] 쓰레드 상세 설정:', thread.id)
    }

    /**
     * 쓰레드 상세 데이터 클리어 (페이지 전환 시 깜빡임 방지)
     */
    function clearThreadDetail() {
      const previousId = threadDetail.value?.id
      threadDetail.value = null
      console.log('🧹 [ThreadStore] 쓰레드 상세 데이터 클리어 (이전 ID:', previousId, ')')
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
      threadsMap.value.set(thread.id, thread)
      console.log('✅ [ThreadStore] 쓰레드 추가 완료:', thread.id)
    }

    /**
     * 쓰레드 업데이트
     * @param {number} threadId 쓰레드 ID
     * @param {Object} updatedThread 업데이트된 쓰레드 데이터
     */
    function updateThread(threadId, updatedThread) {
      const numericThreadId = parseInt(threadId)
      if (threadsMap.value.has(numericThreadId)) {
        threadsMap.value.set(numericThreadId, updatedThread)
      }

      // 상세 페이지 데이터도 업데이트
      if (threadDetail.value?.id === numericThreadId) {
        threadDetail.value = updatedThread
      }

      console.log('✅ [ThreadStore] 쓰레드 업데이트 완료:', numericThreadId)
    }

    /**
     * 쓰레드 삭제
     * @param {number} threadId 쓰레드 ID
     */
    function removeThread(threadId) {
      const numericThreadId = parseInt(threadId)
      threadsMap.value.delete(numericThreadId)

      // 상세 페이지 데이터도 초기화
      if (threadDetail.value?.id === numericThreadId) {
        threadDetail.value = null
      }

      console.log('✅ [ThreadStore] 쓰레드 삭제 완료:', numericThreadId)
    }

    /**
     * 쓰레드 좋아요 상태 업데이트 (Optimistic UI 지원)
     * @param {number} threadId 쓰레드 ID
     * @param {boolean} liked 좋아요 상태
     * @param {number} likesCount 좋아요 수
     */
    function updateThreadLike(threadId, liked, likesCount) {
      const numericThreadId = parseInt(threadId)

      // 목록 업데이트
      if (threadsMap.value.has(numericThreadId)) {
        const thread = threadsMap.value.get(numericThreadId)
        threadsMap.value.set(numericThreadId, {
          ...thread,
          liked,
          likes_count: likesCount,
        })
      }

      // 상세 페이지 업데이트
      if (threadDetail.value?.id === numericThreadId) {
        threadDetail.value = {
          ...threadDetail.value,
          liked,
          likes_count: likesCount,
        }
      }

      console.log('✅ [ThreadStore] 좋아요 상태 동기화:', {
        threadId: numericThreadId,
        liked,
        likesCount,
        inList: threadsMap.value.has(numericThreadId),
        inDetail: threadDetail.value?.id === numericThreadId,
      })
    }

    /**
     * 상태 초기화
     */
    function reset() {
      threadsMap.value.clear()
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
      getThreadById,
      filteredThreads,

      // Actions
      setThreads,
      setThreadDetail,
      clearThreadDetail,
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
