<template>
  <div class="comment-section">
    <!-- 댓글 헤더 -->
    <div class="comment-header">
      <h3 class="comment-title">
        댓글 <span class="comment-count">{{ totalCommentsCount }}</span>
      </h3>
    </div>

    <!-- 댓글 작성 폼 -->
    <CommentForm
      v-if="isAuthenticated"
      :is-submitting="isSubmitting"
      data-testid="comment-form"
      @submit="handleCommentSubmit"
    />

    <!-- 로그인 안내 -->
    <div v-else class="login-prompt" data-testid="login-prompt">
      <p>댓글을 작성하려면 <router-link to="/login">로그인</router-link>해주세요.</p>
    </div>

    <!-- 댓글 목록 -->
    <div class="comment-list-container">
      <div v-if="loading && comments.length === 0" class="loading">
        <div class="loading-spinner"></div>
        <p>댓글을 불러오는 중...</p>
      </div>

      <div v-else-if="comments.length === 0 && !error" class="empty-comments">
        <p>아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!</p>
      </div>

      <CommentList
        v-else
        :comments="comments"
        :editing-comment-id="editingCommentId"
        :replying-to-comment-id="replyingToCommentId"
        :editing-reply-id="editingReplyId"
        :is-submitting="isSubmitting"
        @edit-comment="toggleEditComment"
        @delete-comment="handleDeleteComment"
        @update-comment="handleUpdateComment"
        @reply-to-comment="toggleReplyMode"
        @create-reply="handleCreateReply"
        @edit-reply="toggleEditReply"
        @update-reply="handleUpdateReply"
        @delete-reply="handleDeleteReply"
      />

      <!-- 더 보기 버튼 -->
      <div v-if="pagination.hasNext" class="load-more-container">
        <button
          :disabled="loading"
          class="load-more-btn"
          data-testid="load-more-comments"
          @click="loadMoreComments"
        >
          <span v-if="loading">로딩 중...</span>
          <span v-else>댓글 더 보기</span>
        </button>
      </div>
    </div>

    <!-- 에러 메시지 -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- 삭제 확인 모달 추가 -->
    <ConfirmModal
      v-model="showDeleteCommentModal"
      title="댓글 삭제"
      message="정말 이 댓글을 삭제하시겠습니까?"
      confirm-text="삭제"
      @confirm="confirmDeleteComment"
    />
    <ConfirmModal
      v-model="showDeleteReplyModal"
      title="답글 삭제"
      message="정말 이 답글을 삭제하시겠습니까?"
      confirm-text="삭제"
      @confirm="confirmDeleteReply"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useComments } from '@/composables/useComments'
import CommentForm from '@/components/comment/CommentForm.vue'
import CommentList from '@/components/comment/CommentList.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'

const props = defineProps({
  threadId: {
    type: [String, Number],
    required: true,
  },
})

const {
  comments,
  pagination,
  loading,
  error,
  isSubmitting,
  editingCommentId,
  editingReplyId,
  replyingToCommentId,
  isAuthenticated,
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
} = useComments(props.threadId)

// 삭제 모달 상태 관리
const showDeleteCommentModal = ref(false)
const showDeleteReplyModal = ref(false)
const pendingDeleteCommentId = ref(null)
const pendingDeleteReplyData = ref({ commentId: null, replyId: null })

// 전체 댓글 수 계산 (댓글 + 대댓글)
const totalCommentsCount = computed(() => {
  return comments.value.reduce((total, comment) => {
    // 각 댓글에 대해 대댓글 수를 더함
    const replyCount = comment.replies?.length || 0
    return total + 1 + replyCount // 댓글 1개 + 대댓글 수
  }, 0)
})

// 댓글 작성
const handleCommentSubmit = async (content) => {
  try {
    await createComment(content)
  } catch (error) {
    console.error('댓글 작성 실패:', error)
  }
}

// 댓글 수정
const handleUpdateComment = async (commentId, content) => {
  try {
    await updateComment(commentId, content)
  } catch (error) {
    console.error('댓글 수정 실패:', error)
  }
}

// 댓글 삭제
const handleDeleteComment = (commentId) => {
  pendingDeleteCommentId.value = commentId
  showDeleteCommentModal.value = true
}

// 댓글 삭제 확인
const confirmDeleteComment = async () => {
  try {
    await deleteComment(pendingDeleteCommentId.value)
  } catch (error) {
    console.error('댓글 삭제 실패:', error)
  }
  pendingDeleteCommentId.value = null
}

// 대댓글 작성
const handleCreateReply = async (commentId, content) => {
  try {
    await createReply(commentId, content)
  } catch (error) {
    console.error('답글 작성 실패:', error)
  }
}

// 대댓글 수정
const handleUpdateReply = async (commentId, replyId, content) => {
  try {
    await updateReply(commentId, replyId, content)
  } catch (error) {
    console.error('답글 수정 실패:', error)
  }
}

// 대댓글 삭제
const handleDeleteReply = (commentId, replyId) => {
  pendingDeleteReplyData.value = { commentId, replyId }
  showDeleteReplyModal.value = true
}

// 대댓글 삭제 확인
const confirmDeleteReply = async () => {
  try {
    const { commentId, replyId } = pendingDeleteReplyData.value
    await deleteReply(commentId, replyId)
  } catch (error) {
    console.error('답글 삭제 실패:', error)
  }
  pendingDeleteReplyData.value = { commentId: null, replyId: null }
}

// 컴포넌트 마운트 시 댓글 로드
onMounted(() => {
  loadComments()
})
</script>

<style scoped>
.comment-section {
  margin-top: 2rem;
  padding: 1.5rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.comment-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.comment-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.comment-count {
  color: #6b7280;
  font-weight: 400;
}

.login-prompt {
  padding: 1rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  text-align: center;
  margin-bottom: 1.5rem;
}

.login-prompt a {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
}

.login-prompt a:hover {
  text-decoration: underline;
}

.comment-list-container {
  margin-top: 1.5rem;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  color: #6b7280;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 0.5rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.empty-comments {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

.load-more-container {
  text-align: center;
  margin-top: 1.5rem;
}

.load-more-btn {
  padding: 0.75rem 1.5rem;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.load-more-btn:hover:not(:disabled) {
  background: #e5e7eb;
}

.load-more-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #dc2626;
  font-size: 0.875rem;
}
</style>
