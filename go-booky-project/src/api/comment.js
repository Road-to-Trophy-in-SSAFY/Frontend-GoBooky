import api from '@/api/index'

export const commentAPI = {
  /**
   * 댓글 목록 조회
   */
  async getComments(threadId, page = 1) {
    const response = await api.get(`/threads/${threadId}/comments/`, {
      params: { page },
    })
    return response.data
  },

  /**
   * 댓글 생성
   */
  async createComment(threadId, content) {
    const response = await api.post(`/threads/${threadId}/comments/`, {
      content,
    })
    return response.data
  },

  /**
   * 댓글 수정
   */
  async updateComment(threadId, commentId, content) {
    const response = await api.put(`/threads/${threadId}/comments/${commentId}/`, {
      content,
    })
    return response.data
  },

  /**
   * 댓글 삭제
   */
  async deleteComment(threadId, commentId) {
    await api.delete(`/threads/${threadId}/comments/${commentId}/`)
  },

  /**
   * 대댓글 생성
   */
  async createReply(threadId, commentId, content) {
    const response = await api.post(`/threads/${threadId}/comments/${commentId}/reply/`, {
      content,
    })
    return response.data
  },

  /**
   * 대댓글 수정
   */
  async updateReply(threadId, commentId, replyId, content) {
    const response = await api.put(
      `/threads/${threadId}/comments/${commentId}/replies/${replyId}/`,
      {
        content,
      },
    )
    return response.data
  },

  /**
   * 대댓글 삭제
   */
  async deleteReply(threadId, commentId, replyId) {
    await api.delete(`/threads/${threadId}/comments/${commentId}/replies/${replyId}/`)
  },
}
