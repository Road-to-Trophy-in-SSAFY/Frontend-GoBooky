<template>
  <div class="user-threads-list">
    <!-- 로딩 상태 -->
    <div v-if="isLoading && threads.length === 0" class="loading-container">
      <div class="loading-spinner"></div>
      <p>쓰레드를 불러오는 중...</p>
    </div>

    <!-- 쓰레드 목록 -->
    <div v-else-if="threads.length > 0" class="threads-container">
      <div class="threads-list">
        <div v-for="thread in threads" :key="thread.id" class="thread-item">
          <!-- 쓰레드 헤더 -->
          <div class="thread-header">
            <div class="thread-meta">
              <span class="thread-date">{{ formatDate(thread.created_at) }}</span>
              <div class="thread-stats">
                <span class="stat-item">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  {{ thread.likes_count || 0 }}
                </span>
                <span class="stat-item">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  {{ thread.comments_count || 0 }}
                </span>
              </div>
            </div>
            <button
              v-if="isOwnProfile"
              @click="handleDeleteThread(thread)"
              class="delete-btn"
              title="삭제"
            >
              <svg
                width="16"
                height="16"
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

          <!-- 쓰레드 제목 -->
          <div class="thread-title-section">
            <router-link :to="`/threads/${thread.id}`" class="thread-title-link">
              <h3 class="thread-title">{{ thread.title }}</h3>
            </router-link>
          </div>

          <!-- 쓰레드 내용 미리보기 -->
          <div class="thread-content-preview">
            <p>{{ getContentPreview(thread.content) }}</p>
          </div>

          <!-- 도서 정보 -->
          <div v-if="thread.book" class="book-info">
            <div class="book-cover-small">
              <img
                :src="thread.book.cover || '/default-book-cover.jpg'"
                :alt="thread.book.title"
                @error="handleImageError"
              />
            </div>
            <div class="book-details">
              <span class="book-title">{{ thread.book.title }}</span>
              <span class="book-author">{{ thread.book.author }}</span>
              <span class="book-category">{{ thread.book.category_name }}</span>
            </div>
          </div>

          <!-- 쓰레드 액션 -->
          <div class="thread-actions">
            <router-link :to="`/threads/${thread.id}`" class="view-thread-btn">
              쓰레드 보기
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 12h14M12 5l7 7-7 7"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </router-link>
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
      <div class="empty-icon">📝</div>
      <h3>작성한 쓰레드가 없습니다</h3>
      <p v-if="isOwnProfile">첫 번째 쓰레드를 작성해보세요!</p>
      <p v-else>아직 작성한 쓰레드가 없습니다.</p>
    </div>

    <!-- 에러 상태 -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- 삭제 확인 모달 -->
    <ConfirmModal
      v-if="showDeleteModal"
      title="쓰레드 삭제"
      message="이 쓰레드를 삭제하시겠습니까? 삭제된 쓰레드는 복구할 수 없습니다."
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import ConfirmModal from '@/components/ConfirmModal.vue'

const props = defineProps({
  threads: {
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

const emit = defineEmits(['delete-thread', 'page-change'])

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
const handleDeleteThread = (thread) => {
  deleteTarget.value = thread
  showDeleteModal.value = true
}

const confirmDelete = () => {
  if (deleteTarget.value) {
    emit('delete-thread', deleteTarget.value.id)
  }
  cancelDelete()
}

const cancelDelete = () => {
  showDeleteModal.value = false
  deleteTarget.value = null
}

const goToPage = (page) => {
  if (page >= 1 && page <= props.pagination.totalPages && !props.isLoading) {
    emit('page-change', page)
  }
}

const handleImageError = (event) => {
  event.target.src = '/default-book-cover.jpg'
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

const getContentPreview = (content) => {
  if (!content) return ''

  // HTML 태그 제거
  const textContent = content.replace(/<[^>]*>/g, '')

  // 최대 150자로 제한
  if (textContent.length <= 150) return textContent
  return textContent.substring(0, 150) + '...'
}
</script>

<style scoped>
.user-threads-list {
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

.threads-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.threads-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.thread-item {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s ease;
  position: relative;
}

.thread-item:hover {
  border-color: #d1d5db;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.thread-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.thread-meta {
  display: flex;
  align-items: center;
  gap: 16px;
}

.thread-date {
  font-size: 13px;
  color: #6b7280;
}

.thread-stats {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #6b7280;
}

.delete-btn {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-btn:hover {
  background: #fef2f2;
  color: #dc2626;
}

.thread-title-section {
  margin-bottom: 12px;
}

.thread-title-link {
  text-decoration: none;
}

.thread-title {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  line-height: 1.4;
  transition: color 0.2s ease;
}

.thread-title-link:hover .thread-title {
  color: #3b82f6;
}

.thread-content-preview {
  margin-bottom: 16px;
}

.thread-content-preview p {
  margin: 0;
  line-height: 1.6;
  color: #4b5563;
  font-size: 14px;
}

.book-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  margin-bottom: 16px;
}

.book-cover-small {
  width: 40px;
  height: 56px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}

.book-cover-small img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.book-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.book-title {
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.book-author {
  font-size: 12px;
  color: #6b7280;
}

.book-category {
  font-size: 11px;
  color: #3b82f6;
  background: #eff6ff;
  padding: 2px 6px;
  border-radius: 8px;
  align-self: flex-start;
}

.thread-actions {
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #f3f4f6;
  padding-top: 16px;
}

.view-thread-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.view-thread-btn:hover {
  background: #2563eb;
  transform: translateX(2px);
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
  .thread-item {
    padding: 20px;
  }

  .thread-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .delete-btn {
    align-self: flex-end;
  }

  .thread-title {
    font-size: 16px;
  }

  .book-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .book-details {
    width: 100%;
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
  .thread-item {
    padding: 16px;
  }

  .thread-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .empty-state {
    padding: 60px 16px;
  }

  .empty-icon {
    font-size: 48px;
  }
}
</style>
