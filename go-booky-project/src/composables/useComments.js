import { ref, computed } from 'vue'
import { useCommentStore } from '@/stores/comment'
import { commentAPI } from '@/api/comment'
import { useAuthStore } from '@/stores/auth'

export function useComments(threadId) {
  const commentStore = useCommentStore()
  const authStore = useAuthStore()

  const isSubmitting = ref(false)
  const editingCommentId = ref(null)
  const editingReplyId = ref(null)
  const replyingToCommentId = ref(null)

  // === Computed ===
  const comments = computed(() => commentStore.comments)
  const pagination = computed(() => commentStore.pagination)
  const loading = computed(() => commentStore.loading)
  const error = computed(() => commentStore.error)
  const isAuthenticated = computed(() => {
    const result = authStore.isAuthenticated
    console.log('🔍 [useComments] 인증 상태 확인:', {
      isAuthenticated: result,
      user: authStore.user,
      accessToken: !!authStore.accessToken,
    })
    return result
  })

  // === 댓글 관련 메서드 ===

  /**
   * 댓글 목록 로드
   */
  async function loadComments(page = 1) {
    try {
      commentStore.setLoading(true)
      commentStore.setError(null)

      console.log('🔍 [useComments] 댓글 로드 시작:', { threadId, page })
      const data = await commentAPI.getComments(threadId, page)
      console.log('✅ [useComments] 댓글 로드 성공:', data)

      if (page === 1) {
        commentStore.setComments(data.results)
      } else {
        // 페이지네이션 - 기존 댓글에 추가
        const currentComments = commentStore.comments
        commentStore.setComments([...currentComments, ...data.results])
      }

      commentStore.setPagination(data.pagination)
    } catch (error) {
      console.error('❌ [useComments] 댓글 로드 실패:', error)

      // 404 에러인 경우 (댓글이 없는 경우) 빈 배열로 설정
      if (error.response?.status === 404) {
        console.log('ℹ️ [useComments] 댓글이 없음 - 빈 상태로 설정')
        commentStore.setComments([])
        commentStore.setPagination({
          page: 1,
          totalPages: 1,
          totalCount: 0,
          hasNext: false,
          hasPrevious: false,
        })
        commentStore.setError(null) // 에러 상태 제거
      } else {
        // 다른 에러인 경우에만 에러 메시지 표시
        commentStore.setError('댓글을 불러오는데 실패했습니다.')
      }
    } finally {
      commentStore.setLoading(false)
    }
  }

  /**
   * 댓글 생성
   */
  async function createComment(content) {
    if (!isAuthenticated.value) {
      throw new Error('로그인이 필요합니다.')
    }

    try {
      isSubmitting.value = true

      const newComment = await commentAPI.createComment(threadId, content)

      // Optimistic UI 업데이트
      commentStore.addComment(newComment)

      return newComment
    } catch (error) {
      console.error('댓글 생성 실패:', error)

      // 구체적인 에러 메시지 처리
      if (error.response?.data?.content) {
        const errorData = error.response.data.content
        if (typeof errorData === 'object') {
          throw new Error(errorData.content || '댓글 작성에 실패했습니다.')
        } else {
          throw new Error(errorData)
        }
      } else if (error.response?.status === 401) {
        throw new Error('로그인이 필요합니다.')
      } else if (error.response?.status === 403) {
        throw new Error('댓글 작성 권한이 없습니다.')
      } else if (error.response?.status === 429) {
        throw new Error('너무 많은 요청입니다. 잠시 후 다시 시도해주세요.')
      } else if (error.response?.status >= 500) {
        throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
      } else {
        throw new Error('댓글 작성에 실패했습니다.')
      }
    } finally {
      isSubmitting.value = false
    }
  }

  /**
   * 댓글 수정
   */
  async function updateComment(commentId, content) {
    try {
      isSubmitting.value = true

      const updatedComment = await commentAPI.updateComment(threadId, commentId, content)

      // 스토어 업데이트
      commentStore.updateComment(commentId, updatedComment)

      // 편집 모드 종료
      editingCommentId.value = null

      return updatedComment
    } catch (error) {
      console.error('댓글 수정 실패:', error)
      throw new Error('댓글 수정에 실패했습니다.')
    } finally {
      isSubmitting.value = false
    }
  }

  /**
   * 댓글 삭제
   */
  async function deleteComment(commentId) {
    try {
      await commentAPI.deleteComment(threadId, commentId)

      // 스토어에서 제거
      commentStore.removeComment(commentId)
    } catch (error) {
      console.error('댓글 삭제 실패:', error)
      throw new Error('댓글 삭제에 실패했습니다.')
    }
  }

  // === 대댓글 관련 메서드 ===

  /**
   * 대댓글 생성
   */
  async function createReply(commentId, content) {
    if (!isAuthenticated.value) {
      throw new Error('로그인이 필요합니다.')
    }

    try {
      isSubmitting.value = true

      const newReply = await commentAPI.createReply(threadId, commentId, content)

      // 스토어 업데이트
      commentStore.addReply(commentId, newReply)

      // 답글 모드 종료
      replyingToCommentId.value = null

      return newReply
    } catch (error) {
      console.error('답글 생성 실패:', error)
      throw new Error('답글 작성에 실패했습니다.')
    } finally {
      isSubmitting.value = false
    }
  }

  /**
   * 대댓글 수정
   */
  async function updateReply(commentId, replyId, content) {
    try {
      isSubmitting.value = true

      const updatedReply = await commentAPI.updateReply(threadId, commentId, replyId, content)

      // 스토어 업데이트
      commentStore.updateReply(commentId, replyId, updatedReply)

      // 편집 모드 종료
      editingReplyId.value = null

      return updatedReply
    } catch (error) {
      console.error('답글 수정 실패:', error)
      throw new Error('답글 수정에 실패했습니다.')
    } finally {
      isSubmitting.value = false
    }
  }

  /**
   * 대댓글 삭제
   */
  async function deleteReply(commentId, replyId) {
    try {
      await commentAPI.deleteReply(threadId, commentId, replyId)

      // 스토어에서 제거
      commentStore.removeReply(commentId, replyId)
    } catch (error) {
      console.error('답글 삭제 실패:', error)
      throw new Error('답글 삭제에 실패했습니다.')
    }
  }

  // === UI 상태 관리 ===

  /**
   * 댓글 편집 모드 토글
   */
  function toggleEditComment(commentId) {
    editingCommentId.value = editingCommentId.value === commentId ? null : commentId
  }

  /**
   * 답글 편집 모드 토글
   */
  function toggleEditReply(replyId) {
    editingReplyId.value = editingReplyId.value === replyId ? null : replyId
  }

  /**
   * 답글 작성 모드 토글
   */
  function toggleReplyMode(commentId) {
    replyingToCommentId.value = replyingToCommentId.value === commentId ? null : commentId
  }

  /**
   * 더 많은 댓글 로드
   */
  async function loadMoreComments() {
    if (pagination.value.hasNext && !loading.value) {
      await loadComments(pagination.value.page + 1)
    }
  }

  return {
    // State
    comments,
    pagination,
    loading,
    error,
    isSubmitting,
    editingCommentId,
    editingReplyId,
    replyingToCommentId,
    isAuthenticated,

    // Methods
    loadComments,
    createComment,
    updateComment,
    deleteComment,
    createReply,
    updateReply,
    deleteReply,
    toggleEditComment,
    toggleEditReply,
    toggleReplyMode,
    loadMoreComments,
  }
}
