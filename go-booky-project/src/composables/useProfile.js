import { ref, computed, unref } from 'vue'
import { profileAPI } from '@/api/profile'
import { useApi } from '@/composables/useApi'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'

/**
 * 프로필 관련 Composable
 * - 사용자 활동 데이터 관리
 * - 나의 책, 댓글, 쓰레드 CRUD
 */
export function useProfile(usernameRef) {
  const { execute, isLoading, error, clearError } = useApi()
  const { success: showSuccessToast, error: showErrorToast } = useToast()
  const authStore = useAuthStore()

  // username을 reactive하게 처리
  const username = computed(() => {
    return typeof usernameRef === 'string' ? usernameRef : unref(usernameRef)
  })

  // 상태 관리
  const userBooks = ref([])
  const userComments = ref([])
  const userThreads = ref([])

  const booksPagination = ref({
    page: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrevious: false,
  })

  const commentsPagination = ref({
    page: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrevious: false,
  })

  const threadsPagination = ref({
    page: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrevious: false,
  })

  // 계산된 속성
  const isOwnProfile = computed(() => {
    return authStore.user?.username === username.value
  })

  const hasUserBooks = computed(() => userBooks.value.length > 0)
  const hasUserComments = computed(() => userComments.value.length > 0)
  const hasUserThreads = computed(() => userThreads.value.length > 0)

  // === 사용자 도서 관리 ===

  /**
   * 사용자의 저장된 도서 목록 조회
   * @param {number} page 페이지 번호
   * @returns {Promise} 도서 목록
   */
  const fetchUserBooks = async (page = 1) => {
    try {
      const response = await execute(() => profileAPI.getUserBooks(username.value, { page }))

      if (response.results) {
        // DRF 페이지네이션 응답
        userBooks.value = response.results
        booksPagination.value = {
          page: page,
          totalPages: Math.ceil(response.count / 12), // 페이지당 12개
          totalCount: response.count,
          hasNext: !!response.next,
          hasPrevious: !!response.previous,
        }
      } else {
        // 일반 배열 응답
        userBooks.value = response
      }

      console.log('✅ [useProfile] 사용자 도서 목록 조회 성공:', userBooks.value.length)
      return response
    } catch (err) {
      console.error('❌ [useProfile] 사용자 도서 목록 조회 실패:', err)
      showErrorToast('도서 목록을 불러오는데 실패했습니다.')
      throw err
    }
  }

  /**
   * 도서 저장/저장 해제 토글
   * @param {number} bookId 도서 ID
   * @returns {Promise} 저장 상태
   */
  const toggleBookSave = async (bookId) => {
    try {
      const response = await execute(() => profileAPI.toggleBookSave(bookId))

      if (response.is_saved) {
        showSuccessToast('도서가 저장되었습니다.')
      } else {
        showSuccessToast('도서 저장이 해제되었습니다.')
        // 현재 목록에서 제거
        userBooks.value = userBooks.value.filter((book) => book.id !== bookId)
      }

      console.log('✅ [useProfile] 도서 저장 상태 변경:', response)
      return response
    } catch (err) {
      console.error('❌ [useProfile] 도서 저장 실패:', err)
      showErrorToast('도서 저장 처리에 실패했습니다.')
      throw err
    }
  }

  // === 사용자 댓글 관리 ===

  /**
   * 사용자의 댓글 목록 조회
   * @param {number} page 페이지 번호
   * @returns {Promise} 댓글 목록
   */
  const fetchUserComments = async (page = 1) => {
    try {
      const response = await execute(() => profileAPI.getUserComments(username.value, { page }))

      // 백엔드 응답 구조: { comments: {...}, replies: {...} }
      if (response.comments && response.replies) {
        // 댓글과 대댓글을 하나의 배열로 합치기
        const commentsArray = response.comments.results.map((comment) => ({
          ...comment,
          type: 'comment',
        }))

        const repliesArray = response.replies.results.map((reply) => ({
          ...reply,
          type: 'reply',
        }))

        // 시간순으로 정렬 (최신순)
        const allComments = [...commentsArray, ...repliesArray].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at),
        )

        userComments.value = allComments

        // 페이지네이션 정보 (댓글과 대댓글 합계)
        const totalCount = response.comments.count + response.replies.count
        commentsPagination.value = {
          page: page,
          totalPages: Math.max(response.comments.num_pages, response.replies.num_pages),
          totalCount: totalCount,
          hasNext: response.comments.has_next || response.replies.has_next,
          hasPrevious: response.comments.has_previous || response.replies.has_previous,
        }
      } else if (response.results) {
        // DRF 페이지네이션 응답 (fallback)
        userComments.value = response.results
        commentsPagination.value = {
          page: page,
          totalPages: Math.ceil(response.count / 10),
          totalCount: response.count,
          hasNext: !!response.next,
          hasPrevious: !!response.previous,
        }
      } else {
        // 일반 배열 응답 (fallback)
        userComments.value = response
      }

      console.log('✅ [useProfile] 사용자 댓글 목록 조회 성공:', userComments.value.length)
      return response
    } catch (err) {
      console.error('❌ [useProfile] 사용자 댓글 목록 조회 실패:', err)
      showErrorToast('댓글 목록을 불러오는데 실패했습니다.')
      throw err
    }
  }

  /**
   * 댓글 삭제
   * @param {Object} comment 댓글 객체 (threadId 포함)
   * @returns {Promise} 삭제 결과
   */
  const deleteComment = async (comment) => {
    try {
      // threadId와 commentId가 필요
      const threadId = comment.thread_id || comment.thread?.id
      const commentId = comment.id

      if (!threadId) {
        throw new Error('쓰레드 ID를 찾을 수 없습니다.')
      }

      await execute(() => profileAPI.deleteComment(threadId, commentId))

      // 목록에서 제거
      userComments.value = userComments.value.filter(
        (item) => !(item.type === 'comment' && item.id === commentId),
      )

      showSuccessToast('댓글이 삭제되었습니다.')
      console.log('✅ [useProfile] 댓글 삭제 성공:', commentId)
    } catch (err) {
      console.error('❌ [useProfile] 댓글 삭제 실패:', err)
      showErrorToast('댓글 삭제에 실패했습니다.')
      throw err
    }
  }

  /**
   * 대댓글 삭제
   * @param {Object} reply 대댓글 객체 (threadId, commentId 포함)
   * @returns {Promise} 삭제 결과
   */
  const deleteReply = async (reply) => {
    try {
      // threadId, commentId, replyId가 필요
      const threadId = reply.thread_id || reply.thread?.id
      const commentId = reply.comment_id || reply.comment?.id
      const replyId = reply.id

      if (!threadId || !commentId) {
        throw new Error('쓰레드 ID 또는 댓글 ID를 찾을 수 없습니다.')
      }

      await execute(() => profileAPI.deleteReply(threadId, commentId, replyId))

      // 목록에서 제거
      userComments.value = userComments.value.filter(
        (item) => !(item.type === 'reply' && item.id === replyId),
      )

      showSuccessToast('대댓글이 삭제되었습니다.')
      console.log('✅ [useProfile] 대댓글 삭제 성공:', replyId)
    } catch (err) {
      console.error('❌ [useProfile] 대댓글 삭제 실패:', err)
      showErrorToast('대댓글 삭제에 실패했습니다.')
      throw err
    }
  }

  // === 사용자 쓰레드 관리 ===

  /**
   * 사용자의 쓰레드 목록 조회
   * @param {number} page 페이지 번호
   * @returns {Promise} 쓰레드 목록
   */
  const fetchUserThreads = async (page = 1) => {
    try {
      const response = await execute(() => profileAPI.getUserThreads(username.value, { page }))

      if (response.results) {
        // DRF 페이지네이션 응답
        userThreads.value = response.results
        threadsPagination.value = {
          page: page,
          totalPages: Math.ceil(response.count / 10), // 페이지당 10개
          totalCount: response.count,
          hasNext: !!response.next,
          hasPrevious: !!response.previous,
        }
      } else {
        // 일반 배열 응답
        userThreads.value = response
      }

      console.log('✅ [useProfile] 사용자 쓰레드 목록 조회 성공:', userThreads.value.length)
      return response
    } catch (err) {
      console.error('❌ [useProfile] 사용자 쓰레드 목록 조회 실패:', err)
      showErrorToast('쓰레드 목록을 불러오는데 실패했습니다.')
      throw err
    }
  }

  /**
   * 쓰레드 삭제
   * @param {number} threadId 쓰레드 ID
   * @returns {Promise} 삭제 결과
   */
  const deleteThread = async (threadId) => {
    try {
      await execute(() => profileAPI.deleteThread(threadId))

      // 목록에서 제거
      userThreads.value = userThreads.value.filter((thread) => thread.id !== threadId)

      showSuccessToast('쓰레드가 삭제되었습니다.')
      console.log('✅ [useProfile] 쓰레드 삭제 성공:', threadId)
    } catch (err) {
      console.error('❌ [useProfile] 쓰레드 삭제 실패:', err)
      showErrorToast('쓰레드 삭제에 실패했습니다.')
      throw err
    }
  }

  /**
   * 모든 데이터 초기화
   */
  const resetData = () => {
    userBooks.value = []
    userComments.value = []
    userThreads.value = []

    booksPagination.value = {
      page: 1,
      totalPages: 1,
      totalCount: 0,
      hasNext: false,
      hasPrevious: false,
    }

    commentsPagination.value = {
      page: 1,
      totalPages: 1,
      totalCount: 0,
      hasNext: false,
      hasPrevious: false,
    }

    threadsPagination.value = {
      page: 1,
      totalPages: 1,
      totalCount: 0,
      hasNext: false,
      hasPrevious: false,
    }

    clearError()
    console.log('🔄 [useProfile] 데이터 초기화 완료')
  }

  return {
    // 상태
    userBooks,
    userComments,
    userThreads,
    booksPagination,
    commentsPagination,
    threadsPagination,
    isLoading,
    error,

    // 계산된 속성
    isOwnProfile,
    hasUserBooks,
    hasUserComments,
    hasUserThreads,

    // 메서드
    fetchUserBooks,
    toggleBookSave,
    fetchUserComments,
    deleteComment,
    deleteReply,
    fetchUserThreads,
    deleteThread,
    resetData,
    clearError,
  }
}
