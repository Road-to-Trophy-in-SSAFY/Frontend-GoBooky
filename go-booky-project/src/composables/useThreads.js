import { ref, computed } from 'vue'
import { threadsAPI } from '@/api/threads'
import { useApi } from '@/composables/useApi'
import { useThreadStore } from '@/stores/thread'
import { useToast } from '@/composables/useToast'

/**
 * 지침에 따른 쓰레드 Composable
 * - 쓰레드 관련 로직 캡슐화
 * - CRUD 작업 지원
 * - 좋아요 기능 포함
 * - 스토어와 연동하여 상태 관리
 */
export function useThreads() {
  const { execute, isLoading, error, clearError, reset } = useApi()
  const threadStore = useThreadStore()
  const { error: showErrorToast } = useToast()

  // 스토어에서 상태 가져오기
  const threads = computed(() => threadStore.threads)
  const selectedThread = computed(() => threadStore.threadDetail)
  const pagination = computed(() => threadStore.pagination)

  // 계산된 속성
  const hasThreads = computed(() => threadStore.hasThreads)
  const isFirstPage = computed(() => pagination.value.page === 1)
  const isLastPage = computed(() => pagination.value.page === pagination.value.totalPages)

  /**
   * 쓰레드 목록 조회
   * @param {Object} params 쿼리 파라미터
   * @returns {Promise} 쓰레드 목록
   */
  const fetchThreads = async (params = {}) => {
    try {
      const response = await execute(() => threadsAPI.getThreads(params))

      // 페이지 정보 확인
      const isFirstPage = !params.page || params.page === 1
      const append = !isFirstPage

      // 스토어에 데이터 저장
      if (response.results) {
        // 페이지네이션이 있는 경우
        threadStore.setThreads(response.results, append)

        console.log('📊 [useThreads] 쓰레드 데이터 저장:', {
          page: params.page || 1,
          isFirstPage,
          append,
          resultCount: response.results.length,
          totalInStore: threadStore.threads.length,
        })
        threadStore.setPagination({
          page: params.page || 1,
          totalPages: Math.ceil(response.count / (params.page_size || 10)),
          totalCount: response.count,
          hasNext: Boolean(response.next),
          hasPrevious: Boolean(response.previous),
        })
      } else {
        // 페이지네이션이 없는 경우
        threadStore.setThreads(response, append)
        threadStore.setPagination({
          page: 1,
          totalPages: 1,
          totalCount: response.length,
          hasNext: false,
          hasPrevious: false,
        })
      }

      return response
    } catch (err) {
      console.error('❌ [useThreads] 쓰레드 목록 조회 실패:', err)
      throw err
    }
  }

  /**
   * 쓰레드 상세 데이터 클리어 (페이지 전환 시 깜빡임 방지)
   */
  const clearThreadDetail = () => {
    threadStore.clearThreadDetail()
  }

  /**
   * 쓰레드 상세 조회
   * @param {number} threadId 쓰레드 ID
   * @returns {Promise} 쓰레드 상세 정보
   */
  const fetchThread = async (threadId) => {
    console.log('🔍 [useThreads] fetchThread 시작 - ID:', threadId)

    try {
      console.log('📡 [useThreads] API 호출 시작')
      const response = await execute(() => threadsAPI.getThread(threadId))
      console.log('✅ [useThreads] fetchThread 성공')

      console.log('📋 [useThreads] 받은 데이터:', {
        id: response.id,
        title: response.title,
        cover_img: response.cover_img,
        cover_img_url: response.cover_img_url,
        created_at: response.created_at,
      })

      // 스토어에 저장
      threadStore.setThreadDetail(response)
      console.log('💾 [useThreads] 스토어에 저장 완료')

      return response
    } catch (err) {
      console.error('❌ [useThreads] fetchThread 실패:', err)
      console.error('📊 [useThreads] 에러 상세:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
      })
      throw err
    }
  }

  /**
   * 쓰레드 생성
   * @param {Object} threadData 쓰레드 데이터
   * @returns {Promise} 생성된 쓰레드
   */
  const createThread = async (threadData) => {
    try {
      const response = await execute(() => threadsAPI.createThread(threadData))

      // 스토어에 새 쓰레드 추가
      threadStore.addThread(response)

      console.log('✅ [useThreads] 쓰레드 생성 성공:', response.id)
      return response
    } catch (err) {
      console.error('❌ [useThreads] 쓰레드 생성 실패:', err)
      throw err
    }
  }

  /**
   * 쓰레드 수정
   * @param {number} threadId 쓰레드 ID
   * @param {Object} threadData 수정할 데이터
   * @returns {Promise} 수정된 쓰레드
   */
  const updateThread = async (threadId, threadData) => {
    try {
      const response = await execute(() => threadsAPI.updateThread(threadId, threadData))

      // 스토어에서 쓰레드 업데이트
      threadStore.updateThread(threadId, response)

      console.log('✅ [useThreads] 쓰레드 수정 성공:', threadId)
      return response
    } catch (err) {
      console.error('❌ [useThreads] 쓰레드 수정 실패:', err)
      throw err
    }
  }

  /**
   * 쓰레드 삭제
   * @param {number} threadId 쓰레드 ID
   * @returns {Promise} 삭제 응답
   */
  const deleteThread = async (threadId) => {
    try {
      const response = await execute(() => threadsAPI.deleteThread(threadId))

      // 스토어에서 쓰레드 삭제
      threadStore.removeThread(threadId)

      console.log('✅ [useThreads] 쓰레드 삭제 성공:', threadId)
      return response
    } catch (err) {
      console.error('❌ [useThreads] 쓰레드 삭제 실패:', err)
      throw err
    }
  }

  /**
   * 쓰레드 좋아요/좋아요 취소 (Optimistic UI)
   * @param {number} threadId 쓰레드 ID
   * @returns {Promise} 좋아요 상태
   */
  const toggleLike = async (threadId) => {
    const numericThreadId = parseInt(threadId)
    if (!numericThreadId || isNaN(numericThreadId)) {
      const error = new Error('유효하지 않은 쓰레드 ID입니다.')
      console.error('❌ [useThreads] 유효하지 않은 쓰레드 ID:', threadId)
      throw error
    }

    // 현재 쓰레드 상태 확인
    const currentThread = threadStore.getThreadById(numericThreadId)
    if (!currentThread) {
      const error = new Error('쓰레드를 찾을 수 없습니다.')
      console.error('❌ [useThreads] 쓰레드를 찾을 수 없음:', numericThreadId)
      throw error
    }

    // 원본 상태 저장 (안전한 기본값 제공)
    const originalLiked = Boolean(currentThread.liked)
    const originalCount = Math.max(0, parseInt(currentThread.likes_count) || 0)

    try {
      // Optimistic UI 업데이트
      const optimisticLiked = !originalLiked
      const optimisticCount = originalCount + (optimisticLiked ? 1 : -1)

      console.log('🚀 [useThreads] Optimistic UI 업데이트:', {
        threadId: numericThreadId,
        originalLiked,
        optimisticLiked,
        originalCount,
        optimisticCount,
      })

      // 즉시 UI 업데이트
      threadStore.updateThreadLike(numericThreadId, optimisticLiked, optimisticCount)

      // API 호출
      const response = await execute(() => threadsAPI.toggleLike(numericThreadId))

      // 서버 응답 검증 및 필요시 상태 조정
      if (response.liked !== optimisticLiked || response.likes_count !== optimisticCount) {
        console.log('🔄 [useThreads] 서버 응답과 다름 - 상태 조정:', {
          threadId: numericThreadId,
          optimistic: { liked: optimisticLiked, count: optimisticCount },
          server: { liked: response.liked, count: response.likes_count },
        })
        threadStore.updateThreadLike(numericThreadId, response.liked, response.likes_count)
      } else {
        console.log('✅ [useThreads] Optimistic UI 성공 - 서버 응답 일치')
      }

      return response
    } catch (err) {
      // 실패 시 원래 상태로 롤백
      threadStore.updateThreadLike(numericThreadId, originalLiked, originalCount)

      // 에러 처리
      let errorMessage = '좋아요 처리에 실패했습니다.'
      if (err.response?.status === 401) {
        errorMessage = '로그인이 필요합니다.'
      } else if (err.response?.status === 403) {
        errorMessage = '권한이 없습니다.'
      } else if (err.response?.status === 404) {
        errorMessage = '쓰레드를 찾을 수 없습니다.'
      }

      console.error('❌ [useThreads] 좋아요 토글 실패 - 롤백 완료:', {
        threadId: numericThreadId,
        originalLiked,
        originalCount,
        error: err.message,
      })

      showErrorToast(errorMessage)
      throw new Error(errorMessage)
    }
  }

  /**
   * 다음 페이지 로드
   * @returns {Promise} 다음 페이지 데이터
   */
  const loadNextPage = async () => {
    if (!pagination.value.hasNext) return

    const nextPage = pagination.value.page + 1
    return fetchThreads({ page: nextPage })
  }

  /**
   * 이전 페이지 로드
   * @returns {Promise} 이전 페이지 데이터
   */
  const loadPreviousPage = async () => {
    if (!pagination.value.hasPrevious) return

    const previousPage = pagination.value.page - 1
    return fetchThreads({ page: previousPage })
  }

  /**
   * 특정 페이지 로드
   * @param {number} page 페이지 번호
   * @returns {Promise} 페이지 데이터
   */
  const loadPage = async (page) => {
    return fetchThreads({ page })
  }

  /**
   * 선택된 쓰레드 설정
   * @param {Object} thread 쓰레드 객체
   */
  const setSelectedThread = (thread) => {
    threadStore.setThreadDetail(thread)
  }

  /**
   * 상태 초기화
   */
  const resetThreads = () => {
    threadStore.reset()
    reset()
  }

  /**
   * 여러 쓰레드의 좋아요 상태 조회
   * @param {Array<number>} threadIds 쓰레드 ID 배열
   * @returns {Promise} 좋아요 상태 맵
   */
  const fetchLikeStatus = async (threadIds) => {
    try {
      if (!threadIds || threadIds.length === 0) {
        return {}
      }

      const response = await execute(() => threadsAPI.getLikeStatus(threadIds))

      // 스토어에 좋아요 상태 저장
      threadStore.setLikeStatus(response)

      console.log('✅ [useThreads] 좋아요 상태 조회 성공:', Object.keys(response).length, '개')
      return response
    } catch (err) {
      console.error('❌ [useThreads] 좋아요 상태 조회 실패:', err)
      // 에러가 발생해도 빈 객체 반환 (UI 깨짐 방지)
      return {}
    }
  }

  return {
    // 상태
    threads,
    selectedThread,
    pagination,
    isLoading,
    error,

    // 계산된 속성
    hasThreads,
    isFirstPage,
    isLastPage,

    // 메서드
    fetchThreads,
    fetchThread,
    clearThreadDetail,
    createThread,
    updateThread,
    deleteThread,
    toggleLike,
    loadNextPage,
    loadPreviousPage,
    loadPage,
    setSelectedThread,
    resetThreads,
    clearError,
    fetchLikeStatus,
  }
}

/**
 * 단일 쓰레드 관리를 위한 Composable
 * @param {number} threadId 쓰레드 ID
 * @returns {Object} 쓰레드 관련 상태 및 메서드
 */
export function useThread(threadId) {
  const { execute, isLoading, error, clearError } = useApi()
  const thread = ref(null)

  /**
   * 쓰레드 정보 로드
   */
  const loadThread = async () => {
    if (!threadId) return

    try {
      const response = await execute(() => threadsAPI.getThread(threadId))
      thread.value = response
      return response
    } catch (err) {
      console.error('❌ [useThread] 쓰레드 로드 실패:', err)
      throw err
    }
  }

  /**
   * 쓰레드 정보 새로고침
   */
  const refreshThread = async () => {
    return loadThread()
  }

  /**
   * 쓰레드 좋아요 토글
   */
  const toggleLike = async () => {
    if (!threadId) return

    try {
      const response = await execute(() => threadsAPI.toggleLike(threadId))

      // 쓰레드 상태 업데이트
      if (thread.value) {
        thread.value.liked = response.liked
        thread.value.likes_count = response.likes_count
      }

      return response
    } catch (err) {
      console.error('❌ [useThread] 좋아요 토글 실패:', err)
      throw err
    }
  }

  return {
    // 상태
    thread,
    isLoading,
    error,

    // 메서드
    loadThread,
    refreshThread,
    toggleLike,
    clearError,
  }
}
