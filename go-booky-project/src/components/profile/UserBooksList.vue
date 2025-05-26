<template>
  <div class="user-books-list">
    <!-- 로딩 상태 -->
    <div v-if="isLoading && books.length === 0" class="loading-container">
      <div class="loading-spinner"></div>
      <p>저장된 도서를 불러오는 중...</p>
    </div>

    <!-- 도서 목록 -->
    <div v-else-if="books.length > 0" class="books-container">
      <div class="books-grid">
        <div v-for="book in books" :key="book.id" class="book-card">
          <div class="book-cover-container">
            <img
              :src="book.cover || '/default-book-cover.jpg'"
              :alt="book.title"
              class="book-cover"
              @error="handleImageError"
            />
            <div v-if="isOwnProfile" class="book-actions">
              <button @click="handleRemoveBook(book.id)" class="remove-btn" title="저장 해제">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div class="book-info">
            <h3 class="book-title">{{ book.title }}</h3>
            <p class="book-author">{{ book.author }}</p>
            <p class="book-category">{{ book.category_name }}</p>
            <div class="book-meta">
              <span class="saved-date">저장일: {{ formatDate(book.saved_at) }}</span>
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
      <div class="empty-icon">📚</div>
      <h3>저장된 도서가 없습니다</h3>
      <p v-if="isOwnProfile">관심 있는 도서를 저장해보세요!</p>
      <p v-else>아직 저장된 도서가 없습니다.</p>
    </div>

    <!-- 에러 상태 -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  books: {
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

const emit = defineEmits(['remove-book', 'page-change'])

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
const handleRemoveBook = (bookId) => {
  emit('remove-book', bookId)
}

const goToPage = (page) => {
  if (page >= 1 && page <= props.pagination.totalPages && !props.isLoading) {
    emit('page-change', page)
  }
}

const handleImageError = (event) => {
  event.target.src = '/default-book-cover.jpg'
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<style scoped>
.user-books-list {
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

.books-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.book-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
}

.book-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.book-cover-container {
  position: relative;
  aspect-ratio: 3/4;
  overflow: hidden;
}

.book-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.book-card:hover .book-cover {
  transform: scale(1.05);
}

.book-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.book-card:hover .book-actions {
  opacity: 1;
}

.remove-btn {
  background: rgba(239, 68, 68, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background: rgba(239, 68, 68, 1);
  transform: scale(1.1);
}

.book-info {
  padding: 16px;
}

.book-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.book-author {
  font-size: 12px;
  color: #6b7280;
  margin: 0 0 4px 0;
}

.book-category {
  font-size: 11px;
  color: #3b82f6;
  background: #eff6ff;
  padding: 2px 8px;
  border-radius: 12px;
  display: inline-block;
  margin: 0 0 8px 0;
}

.book-meta {
  border-top: 1px solid #f3f4f6;
  padding-top: 8px;
}

.saved-date {
  font-size: 11px;
  color: #9ca3af;
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
  .books-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 16px;
  }

  .book-info {
    padding: 12px;
  }

  .book-title {
    font-size: 13px;
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
  .books-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
  }

  .empty-state {
    padding: 60px 16px;
  }

  .empty-icon {
    font-size: 48px;
  }
}
</style>
