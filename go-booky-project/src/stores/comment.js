import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useCommentStore = defineStore('comment', () => {
  // === State ===
  const comments = ref([])
  const pagination = ref({
    page: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrevious: false,
  })
  const loading = ref(false)
  const error = ref(null)

  // === Getters ===
  const hasComments = computed(() => comments.value.length > 0)

  const getCommentById = computed(() => {
    return (id) => comments.value.find((comment) => comment.id === parseInt(id))
  })

  // === Actions ===

  /**
   * 댓글 목록 설정
   */
  function setComments(commentList) {
    comments.value = commentList
  }

  /**
   * 페이지네이션 설정
   */
  function setPagination(paginationData) {
    pagination.value = { ...pagination.value, ...paginationData }
  }

  /**
   * 댓글 추가 (목록 맨 앞에)
   */
  function addComment(comment) {
    comments.value.unshift(comment)
    pagination.value.totalCount += 1
  }

  /**
   * 댓글 업데이트
   */
  function updateComment(commentId, updatedComment) {
    const index = comments.value.findIndex((c) => c.id === parseInt(commentId))
    if (index !== -1) {
      comments.value[index] = { ...comments.value[index], ...updatedComment }
    }
  }

  /**
   * 댓글 삭제
   */
  function removeComment(commentId) {
    const index = comments.value.findIndex((c) => c.id === parseInt(commentId))
    if (index !== -1) {
      comments.value.splice(index, 1)
      pagination.value.totalCount -= 1
    }
  }

  /**
   * 대댓글 추가
   */
  function addReply(commentId, reply) {
    const comment = comments.value.find((c) => c.id === parseInt(commentId))
    if (comment) {
      if (!comment.replies) {
        comment.replies = []
      }
      comment.replies.push(reply)
      comment.replies_count = (comment.replies_count || 0) + 1
    }
  }

  /**
   * 대댓글 업데이트
   */
  function updateReply(commentId, replyId, updatedReply) {
    const comment = comments.value.find((c) => c.id === parseInt(commentId))
    if (comment && comment.replies) {
      const replyIndex = comment.replies.findIndex((r) => r.id === parseInt(replyId))
      if (replyIndex !== -1) {
        comment.replies[replyIndex] = { ...comment.replies[replyIndex], ...updatedReply }
      }
    }
  }

  /**
   * 대댓글 삭제
   */
  function removeReply(commentId, replyId) {
    const comment = comments.value.find((c) => c.id === parseInt(commentId))
    if (comment && comment.replies) {
      const replyIndex = comment.replies.findIndex((r) => r.id === parseInt(replyId))
      if (replyIndex !== -1) {
        comment.replies.splice(replyIndex, 1)
        comment.replies_count = Math.max(0, (comment.replies_count || 0) - 1)
      }
    }
  }

  /**
   * 로딩 상태 설정
   */
  function setLoading(isLoading) {
    loading.value = isLoading
  }

  /**
   * 에러 설정
   */
  function setError(errorMessage) {
    error.value = errorMessage
  }

  /**
   * 상태 초기화
   */
  function reset() {
    comments.value = []
    pagination.value = {
      page: 1,
      totalPages: 1,
      totalCount: 0,
      hasNext: false,
      hasPrevious: false,
    }
    loading.value = false
    error.value = null
  }

  return {
    // State
    comments,
    pagination,
    loading,
    error,

    // Getters
    hasComments,
    getCommentById,

    // Actions
    setComments,
    setPagination,
    addComment,
    updateComment,
    removeComment,
    addReply,
    updateReply,
    removeReply,
    setLoading,
    setError,
    reset,
  }
})
