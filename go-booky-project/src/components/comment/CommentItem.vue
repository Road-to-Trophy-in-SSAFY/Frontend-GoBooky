<template>
  <div class="comment-item">
    <!-- 댓글 헤더 -->
    <div class="comment-header">
      <div class="user-info">
        <span class="username">{{ comment.user.username || comment.user.email }}</span>
        <span class="timestamp">{{ formatDate(comment.created_at) }}</span>
        <span v-if="comment.updated_at !== comment.created_at" class="edited">(편집됨)</span>
      </div>

      <!-- 댓글 액션 버튼 -->
      <div v-if="comment.is_author" class="comment-actions">
        <button
          v-if="!isEditing"
          @click="$emit('edit')"
          class="action-btn edit-btn"
          :disabled="isSubmitting"
        >
          편집
        </button>
        <button @click="handleDelete" class="action-btn delete-btn" :disabled="isSubmitting">
          삭제
        </button>
      </div>
    </div>

    <!-- 댓글 내용 -->
    <div class="comment-content">
      <!-- 편집 모드 -->
      <div v-if="isEditing" class="edit-form">
        <textarea
          v-model="editContent"
          :disabled="isSubmitting"
          class="edit-textarea"
          rows="3"
          maxlength="1000"
          @keydown.esc="cancelEdit"
          @keydown.ctrl.enter="saveEdit"
        ></textarea>

        <div class="edit-actions">
          <button @click="saveEdit" :disabled="!isEditValid || isSubmitting" class="save-btn">
            <span v-if="isSubmitting">저장 중...</span>
            <span v-else>저장</span>
          </button>
          <button @click="cancelEdit" :disabled="isSubmitting" class="cancel-btn">취소</button>
        </div>
      </div>

      <!-- 일반 모드 -->
      <div v-else class="comment-text">
        {{ comment.content }}
      </div>
    </div>

    <!-- 댓글 하단 액션 -->
    <div class="comment-footer">
      <button @click="$emit('reply')" class="reply-btn" :disabled="isSubmitting">답글</button>

      <span class="replies-count" v-if="comment.replies_count > 0">
        답글 {{ comment.replies_count }}개
      </span>
    </div>

    <!-- 답글 작성 폼 -->
    <div v-if="isReplying" class="reply-form-container">
      <ReplyForm
        :is-submitting="isSubmitting"
        @submit="handleReplySubmit"
        @cancel="$emit('reply')"
      />
    </div>

    <!-- 답글 목록 -->
    <div v-if="comment.replies && comment.replies.length > 0" class="replies-container">
      <ReplyList
        :replies="comment.replies"
        :editing-reply-id="editingReplyId"
        :is-submitting="isSubmitting"
        @edit-reply="$emit('edit-reply', $event)"
        @update-reply="(replyId, content) => $emit('update-reply', replyId, content)"
        @delete-reply="(replyId) => $emit('delete-reply', replyId)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import ReplyForm from '@/components/comment/ReplyForm.vue'
import ReplyList from '@/components/comment/ReplyList.vue'

const props = defineProps({
  comment: {
    type: Object,
    required: true,
  },
  isEditing: {
    type: Boolean,
    default: false,
  },
  isReplying: {
    type: Boolean,
    default: false,
  },
  editingReplyId: {
    type: [String, Number],
    default: null,
  },
  isSubmitting: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  'edit',
  'delete',
  'update',
  'reply',
  'create-reply',
  'edit-reply',
  'update-reply',
  'delete-reply',
])

const editContent = ref('')

// 편집 내용 유효성 검사
const isEditValid = computed(() => {
  return editContent.value.trim().length >= 3 && editContent.value.length <= 1000
})

// 편집 모드 시작 시 기존 내용으로 초기화
watch(
  () => props.isEditing,
  (newVal) => {
    if (newVal) {
      editContent.value = props.comment.content
    }
  },
)

// 날짜 포맷팅
const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = (now - date) / (1000 * 60 * 60)

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))
    return diffInMinutes < 1 ? '방금 전' : `${diffInMinutes}분 전`
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}시간 전`
  } else if (diffInHours < 24 * 7) {
    return `${Math.floor(diffInHours / 24)}일 전`
  } else {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }
}

// 편집 저장
const saveEdit = () => {
  if (!isEditValid.value) return
  emit('update', editContent.value.trim())
}

// 편집 취소
const cancelEdit = () => {
  editContent.value = props.comment.content
  emit('edit')
}

// 삭제 확인
const handleDelete = () => {
  if (confirm('정말 댓글을 삭제하시겠습니까?')) {
    emit('delete')
  }
}

// 답글 작성
const handleReplySubmit = (content) => {
  emit('create-reply', content)
}
</script>

<style scoped>
.comment-item {
  padding: 1rem;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.username {
  font-weight: 600;
  color: #1f2937;
}

.timestamp {
  font-size: 0.875rem;
  color: #6b7280;
}

.edited {
  font-size: 0.75rem;
  color: #9ca3af;
  font-style: italic;
}

.comment-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: #fff;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover:not(:disabled) {
  background: #f3f4f6;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.edit-btn:hover:not(:disabled) {
  border-color: #3b82f6;
  color: #3b82f6;
}

.delete-btn:hover:not(:disabled) {
  border-color: #dc2626;
  color: #dc2626;
}

.comment-content {
  margin-bottom: 0.75rem;
}

.comment-text {
  line-height: 1.6;
  color: #374151;
  white-space: pre-wrap;
}

.edit-form {
  margin-bottom: 0.5rem;
}

.edit-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  line-height: 1.5;
  resize: vertical;
  min-height: 80px;
  margin-bottom: 0.5rem;
}

.edit-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.edit-textarea:disabled {
  background: #f3f4f6;
  color: #6b7280;
  cursor: not-allowed;
}

.edit-actions {
  display: flex;
  gap: 0.5rem;
}

.save-btn {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.2s;
}

.save-btn:hover:not(:disabled) {
  background: #2563eb;
}

.save-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.cancel-btn {
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn:hover:not(:disabled) {
  background: #e5e7eb;
}

.cancel-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.comment-footer {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.reply-btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s;
}

.reply-btn:hover:not(:disabled) {
  color: #3b82f6;
}

.reply-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.replies-count {
  font-size: 0.875rem;
  color: #6b7280;
}

.reply-form-container {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.replies-container {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}
</style>
