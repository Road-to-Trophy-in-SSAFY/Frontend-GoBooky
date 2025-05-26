<template>
  <div class="user-comments-list">
    <!-- 로딩 상태 -->
    <div v-if="isLoading && comments.length === 0" class="loading-container">
      <div class="loading-spinner"></div>
      <p>댓글을 불러오는 중...</p>
    </div>

    <!-- 댓글 목록 -->
    <div v-else-if="comments.length > 0" class="comments-container">
      <div class="comments-list">
        <div
          v-for="comment in comments"
          :key="`${comment.type}-${comment.id}`"
          class="comment-item"
        >
          <!-- 댓글 헤더 -->
          <div class="comment-header">
            <div class="comment-type">
              <span v-if="comment.type === 'comment'" class="type-badge comment-badge"
                >💬 댓글</span
              >
              <span v-else class="type-badge reply-badge">↳ 대댓글</span>
            </div>
            <div class="comment-meta">
              <span class="comment-date">{{ formatDate(comment.created_at) }}</span>
              <button
                v-if="isOwnProfile"
                @click="handleDeleteComment(comment)"
                class="delete-btn"
                title="삭제"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          <!-- 댓글 내용 -->
          <div class="comment-content">
            <p>{{ comment.content }}</p>
          </div>

          <!-- 쓰레드 정보 -->
          <div class="thread-info">
            <router-link :to="`/threads/${comment.thread_id}`" class="thread-link">
              <div class="thread-title">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                {{ comment.thread_title }}
              </div>
              <span class="view-thread">쓰레드 보기 →</span>
            </router-link>
          </div>

          <!-- 대댓글인 경우 원본 댓글 정보 -->
          <div
            v-if="comment.type === 'reply' && comment.parent_comment"
            class="parent-comment-info"
          >
            <div class="parent-comment">
              <span class="parent-label">답글 대상:</span>
              <span class="parent-content">{{
                truncateText(comment.parent_comment.content, 50)
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 페이지네이션 -->
      <div v-if="pagination.totalPages > 1" class="pagination-container">
        <nav class="pagination">
          <button
            :disabled="!pagination.hasPrevious || isLoading"
            @click="goToPage(pagination.page - 1)"
            class="pagination-btn"
          >
            ‹ 이전
          </button>

          <div class="page-numbers">
            <button
              v-for="pageNum in visiblePages"
              :key="pageNum"
              :class="['page-btn', { active: pageNum === pagination.page }]"
              :disabled="isLoading"
              @click="goToPage(pageNum)"
            >
              {{ pageNum }}
            </button>
          </div>

          <button
            :disabled="!pagination.hasNext || isLoading"
            @click="goToPage(pagination.page + 1)"
            class="pagination-btn"
          >
            다음 ›
          </button>
        </nav>
      </div>
    </div>

    <!-- 빈 상태 -->
    <div v-else class="empty-state">
      <div class="empty-icon">💬</div>
      <h3>작성한 댓글이 없습니다</h3>
      <p v-if="isOwnProfile">쓰레드에 댓글을 작성해보세요!</p>
      <p v-else>아직 작성한 댓글이 없습니다.</p>
    </div>

    <!-- 에러 상태 -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- 삭제 확인 모달 -->
    <ConfirmModal
      v-model="showDeleteModal"
      :title="deleteTarget?.type === 'reply' ? '대댓글 삭제' : '댓글 삭제'"
      :message="
        deleteTarget?.type === 'reply'
          ? '이 대댓글을 삭제하시겠습니까?'
          : '이 댓글을 삭제하시겠습니까?'
      "
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import ConfirmModal from '@/components/ConfirmModal.vue'

const props = defineProps({
  comments: {
    type: Array,
    default: () => [],
  },
  pagination: {
    type: Object,
    default: () => ({
      page: 1,
      totalPages: 1,
      totalCount: 0,
      hasNext: false,
      hasPrevious: false,
    }),
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: null,
  },
  isOwnProfile: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['delete-comment', 'delete-reply', 'page-change'])

// 삭제 모달 상태
const showDeleteModal = ref(false)
const deleteTarget = ref(null)

// 표시할 페이지 번호들 계산
const visiblePages = computed(() => {
  const current = props.pagination.page
  const total = props.pagination.totalPages
  const pages = []

  let start = Math.max(1, current - 2)
  let end = Math.min(total, start + 4)

  if (end - start < 4) {
    start = Math.max(1, end - 4)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

// 이벤트 핸들러
const handleDeleteComment = (comment) => {
  deleteTarget.value = comment
  showDeleteModal.value = true
}

const confirmDelete = () => {
  if (deleteTarget.value) {
    if (deleteTarget.value.type === 'reply') {
      emit('delete-reply', deleteTarget.value.id)
    } else {
      emit('delete-comment', deleteTarget.value.id)
    }
  }
  // 모달은 ConfirmModal 컴포넌트에서 자동으로 닫힘
  deleteTarget.value = null
}

const goToPage = (page) => {
  if (page >= 1 && page <= props.pagination.totalPages && !props.isLoading) {
    emit('page-change', page)
  }
}

// 유틸리티 함수
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
</script>

<style scoped>
.user-comments-list {
  min-height: 400px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #6b7280;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.comments-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s ease;
}

.comment-item:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.comment-type {
  display: flex;
  align-items: center;
}

.type-badge {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.comment-badge {
  background: #dbeafe;
  color: #1e40af;
}

.reply-badge {
  background: #f3e8ff;
  color: #7c3aed;
}

.comment-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.comment-date {
  font-size: 12px;
  color: #6b7280;
}

.delete-btn {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-btn:hover {
  background: #fef2f2;
  color: #dc2626;
}

.comment-content {
  margin-bottom: 16px;
}

.comment-content p {
  margin: 0;
  line-height: 1.6;
  color: #374151;
}

.thread-info {
  border-top: 1px solid #f3f4f6;
  padding-top: 12px;
}

.thread-link {
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-decoration: none;
  color: #6b7280;
  transition: color 0.2s ease;
}

.thread-link:hover {
  color: #3b82f6;
}

.thread-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
}

.view-thread {
  font-size: 12px;
  color: #3b82f6;
}

.parent-comment-info {
  margin-top: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  border-left: 3px solid #e5e7eb;
}

.parent-comment {
  font-size: 13px;
  color: #6b7280;
}

.parent-label {
  font-weight: 600;
  margin-right: 8px;
}

.parent-content {
  font-style: italic;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-btn {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.pagination-btn:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 4px;
}

.page-btn {
  width: 40px;
  height: 40px;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-btn:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.page-btn.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #6b7280;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 8px 0;
}

.empty-state p {
  font-size: 14px;
  margin: 0;
}

.error-message {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 6px;
  margin-top: 16px;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .comment-item {
    padding: 16px;
  }

  .comment-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .comment-meta {
    align-self: flex-end;
  }

  .thread-link {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .pagination {
    flex-wrap: wrap;
    justify-content: center;
    gap: 4px;
  }

  .pagination-btn {
    padding: 6px 12px;
    font-size: 14px;
  }

  .page-btn {
    width: 36px;
    height: 36px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .comment-item {
    padding: 12px;
  }

  .empty-state {
    padding: 60px 16px;
  }

  .empty-icon {
    font-size: 48px;
  }
}
</style>
