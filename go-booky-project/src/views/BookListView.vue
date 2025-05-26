<template>
  <div class="book-list-container">
    <!-- 검색 및 필터 섹션 -->
    <div class="search-section">
      <BookSearch />
    </div>

    <div class="main-content">
      <!-- 사이드바 -->
      <div class="sidebar">
        <Category />
      </div>

      <!-- 책 목록 컨텐츠 -->
      <div class="content">
        <!-- 로딩 상태 -->
        <div v-if="loading && books.length === 0" class="loading-container">
          <div class="loading-spinner"></div>
          <p>도서 목록을 불러오는 중...</p>
        </div>

        <!-- 책 목록 -->
        <div v-else-if="books.length > 0" class="books-container">
          <!-- 페이지 전환 로딩 오버레이 -->
          <div v-if="loading" class="page-loading-overlay">
            <div class="page-loading-spinner"></div>
          </div>

          <!-- 책 목록 with 애니메이션 -->
          <Transition name="book-list" mode="out-in">
            <BookList
              :key="pagination.page"
              :books="bookStore.filteredBooks"
              class="book-list-animated"
            />
          </Transition>

          <!-- 페이지네이션 -->
          <div v-if="pagination.totalPages > 1" class="pagination-container">
            <nav class="pagination">
              <!-- 이전 페이지 -->
              <button
                :disabled="!pagination.hasPrevious || loading"
                @click="goToPage(pagination.page - 1)"
                class="pagination-btn prev-btn"
                :class="{ loading: loading }"
              >
                <span v-if="!loading">‹ 이전</span>
                <span v-else class="btn-loading">
                  <div class="btn-spinner"></div>
                </span>
              </button>

              <!-- 페이지 번호들 -->
              <div class="page-numbers">
                <button
                  v-for="pageNum in visiblePages"
                  :key="pageNum"
                  :class="[
                    'page-btn',
                    {
                      active: pageNum === pagination.page,
                      loading: loading && pageNum !== pagination.page,
                    },
                  ]"
                  :disabled="loading"
                  @click="goToPage(pageNum)"
                >
                  {{ pageNum }}
                </button>
              </div>

              <!-- 다음 페이지 -->
              <button
                :disabled="!pagination.hasNext || loading"
                @click="goToPage(pagination.page + 1)"
                class="pagination-btn next-btn"
                :class="{ loading: loading }"
              >
                <span v-if="!loading">다음 ›</span>
                <span v-else class="btn-loading">
                  <div class="btn-spinner"></div>
                </span>
              </button>
            </nav>

            <!-- 페이지 정보 -->
            <div class="pagination-info">
              {{ pagination.page }} / {{ pagination.totalPages }} 페이지 (총
              {{ pagination.totalCount }}권)
            </div>
          </div>
        </div>

        <!-- 빈 상태 -->
        <div v-else class="empty-state">
          <p>등록된 도서가 없습니다.</p>
        </div>

        <!-- 에러 상태 -->
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBookStore } from '@/stores/books.js'
import BookList from '@/components/BookList.vue'
import Category from '@/components/CategoryList.vue'
import BookSearch from '@/components/BookSearch.vue'
import { useBooks } from '@/composables/useBooks'
import { useImageCache } from '@/composables/useImageCache'

// 지침에 따른 Composables 사용
const { fetchBooks } = useBooks()
const { preloadImages } = useImageCache()
const bookStore = useBookStore()
const route = useRoute()
const router = useRouter()

// 상태 관리
const loading = ref(false)
const error = ref(null)
const books = ref([])
const pagination = ref({
  page: 1,
  totalPages: 1,
  totalCount: 0,
  hasNext: false,
  hasPrevious: false,
})

// 현재 페이지 (URL 쿼리 파라미터에서 가져오기)
const currentPage = computed(() => {
  return parseInt(route.query.page) || 1
})

// 표시할 페이지 번호들 계산
const visiblePages = computed(() => {
  const current = pagination.value.page
  const total = pagination.value.totalPages
  const pages = []

  // 최대 5개 페이지 번호 표시
  let start = Math.max(1, current - 2)
  let end = Math.min(total, start + 4)

  // 끝에서 5개가 안 되면 시작점 조정
  if (end - start < 4) {
    start = Math.max(1, end - 4)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

// 도서 목록 로드
const loadBooks = async (page = 1) => {
  try {
    loading.value = true
    error.value = null

    console.log('📚 [BookListView] 도서 목록 로드 시작:', { page })

    const response = await fetchBooks({ page })

    // 응답 구조 확인 및 처리
    if (response.results) {
      // DRF 페이지네이션 응답
      books.value = response.results
      pagination.value = {
        page: page,
        totalPages: Math.ceil(response.count / 9), // PAGE_SIZE = 9
        totalCount: response.count,
        hasNext: !!response.next,
        hasPrevious: !!response.previous,
      }
      bookStore.setBooks(response.results)
    } else {
      // 일반 배열 응답
      books.value = response
      bookStore.setBooks(response)
    }

    console.log('✅ [BookListView] 도서 목록 로드 완료:', {
      count: books.value.length,
      pagination: pagination.value,
    })

    // 현재 페이지 이미지 프리로드
    const currentImages = books.value
      .map((book) => book.cover)
      .filter((cover) => cover && cover !== '/default-book-cover.jpg')

    if (currentImages.length > 0) {
      preloadImages(currentImages)
    }

    // 다음 페이지 이미지 미리 로드 (백그라운드에서)
    if (pagination.value.hasNext) {
      setTimeout(async () => {
        try {
          const nextPageResponse = await fetchBooks({ page: page + 1 })
          if (nextPageResponse.results) {
            const nextPageImages = nextPageResponse.results
              .map((book) => book.cover)
              .filter((cover) => cover && cover !== '/default-book-cover.jpg')

            if (nextPageImages.length > 0) {
              preloadImages(nextPageImages)
            }
          }
        } catch (err) {
          console.log('다음 페이지 이미지 프리로드 실패:', err)
        }
      }, 500) // 현재 페이지 로드 후 0.5초 뒤에 실행
    }
  } catch (err) {
    console.error('❌ [BookListView] 도서 목록 로드 실패:', err)
    error.value = '도서 목록을 불러오는데 실패했습니다.'
  } finally {
    // 최소 로딩 시간 보장 (UX 개선)
    setTimeout(() => {
      loading.value = false
    }, 300)
  }
}

// 페이지 이동
const goToPage = async (page) => {
  if (page < 1 || page > pagination.value.totalPages || loading.value) {
    return
  }

  // URL 업데이트
  await router.push({
    query: { ...route.query, page: page.toString() },
  })
}

// URL 쿼리 파라미터 변경 감지
watch(
  currentPage,
  (newPage) => {
    if (newPage !== pagination.value.page) {
      loadBooks(newPage)
    }
  },
  { immediate: false },
)

// 컴포넌트 마운트 시 초기 로드
onMounted(() => {
  loadBooks(currentPage.value)
})
</script>

<style scoped>
.book-list-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.search-section {
  margin-bottom: 20px;
}

.main-content {
  display: flex;
  gap: 20px;
}

.sidebar {
  flex: 0 0 250px;
}

.content {
  flex: 1;
  min-height: 400px;
  position: relative;
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
  gap: 20px;
  position: relative;
}

/* 페이지 전환 로딩 오버레이 */
.page-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 8px;
}

.page-loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* 책 목록 애니메이션 */
.book-list-animated {
  transition: all 0.3s ease;
}

.book-list-enter-active,
.book-list-leave-active {
  transition: all 0.3s ease;
}

.book-list-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.book-list-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.pagination-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-top: 40px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 8px;
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
  min-width: 60px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination-btn:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-btn.loading {
  pointer-events: none;
}

.btn-loading {
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #f3f4f6;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
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

.page-btn.loading {
  opacity: 0.6;
  pointer-events: none;
}

.pagination-info {
  color: #6b7280;
  font-size: 14px;
  text-align: center;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
}

.error-message {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 6px;
  margin-top: 16px;
}

/* 반응형 레이아웃 */
@media (max-width: 1024px) {
  .book-list-container {
    padding: 16px;
  }

  .main-content {
    gap: 16px;
  }

  .sidebar {
    flex: 0 0 200px;
  }
}

@media (max-width: 768px) {
  .book-list-container {
    padding: 12px;
  }

  .main-content {
    flex-direction: column;
    gap: 20px;
  }

  .sidebar {
    flex: none;
    order: -1;
  }

  .pagination {
    flex-wrap: wrap;
    justify-content: center;
    gap: 4px;
  }

  .page-numbers {
    order: -1;
    margin-bottom: 8px;
  }

  .pagination-btn {
    padding: 6px 12px;
    font-size: 14px;
    min-width: 50px;
    height: 36px;
  }

  .page-btn {
    width: 36px;
    height: 36px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .book-list-container {
    padding: 8px;
  }

  .search-section {
    margin-bottom: 16px;
  }

  .pagination-container {
    padding: 16px;
    margin-top: 24px;
  }

  .pagination-info {
    font-size: 12px;
  }

  .loading-container {
    padding: 40px 16px;
  }

  .empty-state {
    padding: 40px 16px;
  }
}
</style>
