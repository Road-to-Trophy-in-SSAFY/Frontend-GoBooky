import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useComments } from '@/composables/useComments'
import { createPinia, setActivePinia } from 'pinia'

// API 모킹
vi.mock('@/api/comment', () => ({
  commentAPI: {
    getComments: vi.fn(),
    createComment: vi.fn(),
    updateComment: vi.fn(),
    deleteComment: vi.fn(),
    createReply: vi.fn(),
    updateReply: vi.fn(),
    deleteReply: vi.fn(),
  },
}))

// Auth store 모킹
vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    isAuthed: true,
  }),
}))

describe('useComments', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('댓글 목록을 로드할 수 있다', async () => {
    const { commentAPI } = await import('@/api/comment')
    const mockComments = {
      results: [
        {
          id: 1,
          content: '테스트 댓글',
          user: { id: 1, nickname: '사용자1' },
          replies: [],
          replies_count: 0,
        },
      ],
      pagination: {
        page: 1,
        total_pages: 1,
        total_count: 1,
        has_next: false,
        has_previous: false,
      },
    }

    commentAPI.getComments.mockResolvedValue(mockComments)

    const { loadComments, comments, pagination } = useComments(1)

    await loadComments()

    expect(comments.value).toHaveLength(1)
    expect(comments.value[0].content).toBe('테스트 댓글')
    expect(pagination.value.total_count).toBe(1)
  })

  it('댓글을 생성할 수 있다', async () => {
    const { commentAPI } = await import('@/api/comment')
    const mockComment = {
      id: 2,
      content: '새 댓글',
      user: { id: 1, nickname: '사용자1' },
      replies: [],
      replies_count: 0,
    }

    commentAPI.createComment.mockResolvedValue(mockComment)

    const { createComment, comments } = useComments(1)

    await createComment('새 댓글')

    expect(comments.value).toHaveLength(1)
    expect(comments.value[0].content).toBe('새 댓글')
  })

  it('댓글을 수정할 수 있다', async () => {
    const { commentAPI } = await import('@/api/comment')
    const updatedComment = {
      id: 1,
      content: '수정된 댓글',
      user: { id: 1, nickname: '사용자1' },
    }

    commentAPI.updateComment.mockResolvedValue(updatedComment)

    const { updateComment, editingCommentId } = useComments(1)

    await updateComment(1, '수정된 댓글')

    expect(editingCommentId.value).toBeNull()
  })

  it('댓글을 삭제할 수 있다', async () => {
    const { commentAPI } = await import('@/api/comment')
    commentAPI.deleteComment.mockResolvedValue()

    const { deleteComment } = useComments(1)

    await expect(deleteComment(1)).resolves.toBeUndefined()
  })

  it('대댓글을 생성할 수 있다', async () => {
    const { commentAPI } = await import('@/api/comment')
    const mockReply = {
      id: 1,
      content: '새 답글',
      user: { id: 1, nickname: '사용자1' },
    }

    commentAPI.createReply.mockResolvedValue(mockReply)

    const { createReply, replyingToCommentId } = useComments(1)

    await createReply(1, '새 답글')

    expect(replyingToCommentId.value).toBeNull()
  })

  it('편집 모드를 토글할 수 있다', () => {
    const { toggleEditComment, editingCommentId } = useComments(1)

    // 편집 모드 활성화
    toggleEditComment(1)
    expect(editingCommentId.value).toBe(1)

    // 편집 모드 비활성화
    toggleEditComment(1)
    expect(editingCommentId.value).toBeNull()
  })

  it('답글 모드를 토글할 수 있다', () => {
    const { toggleReplyMode, replyingToCommentId } = useComments(1)

    // 답글 모드 활성화
    toggleReplyMode(1)
    expect(replyingToCommentId.value).toBe(1)

    // 답글 모드 비활성화
    toggleReplyMode(1)
    expect(replyingToCommentId.value).toBeNull()
  })

  it('에러 처리가 올바르게 작동한다', async () => {
    const { commentAPI } = await import('@/api/comment')
    commentAPI.createComment.mockRejectedValue(new Error('API 에러'))

    const { createComment } = useComments(1)

    await expect(createComment('테스트')).rejects.toThrow('댓글 작성에 실패했습니다.')
  })

  it('로딩 상태가 올바르게 관리된다', async () => {
    const { commentAPI } = await import('@/api/comment')
    commentAPI.getComments.mockImplementation(
      () =>
        new Promise((resolve) => setTimeout(() => resolve({ results: [], pagination: {} }), 100)),
    )

    const { loadComments, loading } = useComments(1)

    const loadPromise = loadComments()
    expect(loading.value).toBe(true)

    await loadPromise
    expect(loading.value).toBe(false)
  })
})
