<!-- 쓰레드 전체 목록 조회 view -->
<template>
  <div class="thread-list-container">
    <div class="header-actions">
      <h1 class="page-title">독서 기록</h1>
    </div>

    <!-- 카테고리 필터 -->
    <div class="category-filter">
      <button :class="{ active: selectedCategory === null }" @click="selectCategory(null)">
        전체
      </button>
      <button
        v-for="category in categories"
        :key="category.pk"
        :class="{ active: selectedCategory === category.fields.name }"
        @click="selectCategory(category.fields.name)"
      >
        {{ category.fields.name }}
      </button>
    </div>

    <!-- 쓰레드 목록 -->
    <div class="thread-content">
      <!-- 로딩 상태 (초기 로드) -->
      <div v-if="isLoading && threads.length === 0" class="loading-container">
        <div class="loading-spinner"></div>
        <p>독서 기록을 불러오는 중...</p>
      </div>

      <!-- 쓰레드 목록 -->
      <div v-else-if="filteredThreads.length > 0" class="thread-list">
        <div
          v-for="thread in filteredThreads"
          :key="thread.id"
          class="thread-item"
          :data-id="thread.id"
        >
          <div class="thread-image">
            <img
              :src="getThreadImage(thread)"
              alt="쓰레드 이미지"
              class="cover-thumbnail"
              @error="handleImageError($event, thread)"
            />
          </div>
          <div class="thread-info">
            <h3>{{ thread.title }}</h3>
            <p>책: {{ thread.book.title }}</p>
            <p>카테고리: {{ thread.book.category_name }}</p>
            <div class="thread-actions">
              <button @click="goToThreadDetail(thread.id)" class="detail-btn">자세히 보기</button>
            </div>
            <button
              @click.stop="toggleLike(thread)"
              class="like-btn"
              :class="{ liked: thread.liked, animate: isAnimating(thread.id) }"
              :aria-label="thread.liked ? '좋아요 취소' : '좋아요'"
              :aria-pressed="thread.liked"
              type="button"
            >
              <Transition name="heart" mode="out-in">
                <span v-if="thread.liked" key="filled" class="heart-icon filled" aria-hidden="true"
                  >❤️</span
                >
                <span v-else key="empty" class="heart-icon empty" aria-hidden="true">🤍</span>
              </Transition>
              <Transition name="count" mode="out-in">
                <span :key="thread.likes_count" class="like-count">{{ thread.likes_count }}</span>
              </Transition>
            </button>
          </div>
        </div>
      </div>

      <!-- 빈 상태 -->
      <div v-else class="empty-state">
        <p>등록된 독서 기록이 없습니다.</p>
      </div>

      <!-- 무한 스크롤 로딩 -->
      <div v-if="loadingMore" class="loading-more">
        <div class="loading-spinner small"></div>
        <p>더 많은 기록을 불러오는 중...</p>
      </div>

      <!-- 더 이상 로드할 데이터가 없을 때 -->
      <div v-if="!hasMore && threads.length > 0" class="end-message">
        <p>모든 독서 기록을 확인했습니다.</p>
      </div>

      <!-- 에러 메시지 -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>

    <!-- 스크롤 감지용 센티넬 -->
    <div ref="scrollSentinel" class="scroll-sentinel"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { categoriesData } from '@/stores/categoriesData.js'
import { useThreads } from '@/composables/useThreads'
import { useToast } from '@/composables/useToast'
import { useAnimation } from '@/composables/useAnimation'

// 지침에 따른 Composables 사용
const {
  threads,
  pagination,
  isLoading,
  error,
  fetchThreads,
  toggleLike: toggleThreadLike,
} = useThreads()
const { error: showErrorToast } = useToast()
const { startAnimation, isAnimating } = useAnimation()
const router = useRouter()

// 상태 관리
const categories = categoriesData
const selectedCategory = ref(null)
const API_URL = 'http://127.0.0.1:8000'

// 무한 스크롤 관련 상태
const loadingMore = ref(false)
const scrollSentinel = ref(null)
const observer = ref(null)

// computed 속성들
const hasMore = computed(() => pagination.value.hasNext)

onMounted(async () => {
  await loadInitialThreads()
  setupInfiniteScroll()
})

onUnmounted(() => {
  if (observer.value) {
    observer.value.disconnect()
  }
})

// 초기 쓰레드 로드
const loadInitialThreads = async () => {
  try {
    console.log('🧵 [ThreadListView] 초기 쓰레드 로드 시작')
    await fetchThreads({ page: 1 })
    console.log('✅ [ThreadListView] 초기 로드 완료:', threads.value.length)
  } catch (err) {
    console.error('❌ [ThreadListView] 초기 로드 실패:', err)
    showErrorToast('독서 기록을 불러오는데 실패했습니다.')
  }
}

// 추가 쓰레드 로드 (무한 스크롤)
const loadMoreThreads = async () => {
  if (loadingMore.value || !hasMore.value) {
    return
  }

  try {
    loadingMore.value = true
    const nextPage = pagination.value.page + 1

    console.log('🔄 [ThreadListView] 추가 쓰레드 로드:', nextPage)

    const response = await fetchThreads({ page: nextPage })

    console.log('✅ [ThreadListView] 추가 로드 완료:', {
      newCount: response.results?.length || 0,
      totalCount: threads.value.length,
      hasMore: hasMore.value,
    })
  } catch (err) {
    console.error('❌ [ThreadListView] 추가 로드 실패:', err)
    showErrorToast('추가 데이터를 불러오는데 실패했습니다.')
  } finally {
    loadingMore.value = false
  }
}

// 무한 스크롤 설정
const setupInfiniteScroll = async () => {
  await nextTick()

  if (!scrollSentinel.value) {
    console.warn('⚠️ [ThreadListView] 스크롤 센티넬을 찾을 수 없습니다.')
    return
  }

  observer.value = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (entry.isIntersecting && hasMore.value && !loadingMore.value) {
        console.log('👁️ [ThreadListView] 스크롤 센티넬 감지 - 추가 로드 시작')
        loadMoreThreads()
      }
    },
    {
      root: null,
      rootMargin: '100px', // 100px 전에 미리 로드
      threshold: 0.1,
    },
  )

  observer.value.observe(scrollSentinel.value)
  console.log('✅ [ThreadListView] 무한 스크롤 설정 완료')
}

const getThreadImage = (thread) => {
  if (thread.cover_img_url) {
    return thread.cover_img_url
  }
  if (thread.cover_img) {
    // 절대 경로인지 확인
    if (thread.cover_img.startsWith('http')) {
      return thread.cover_img
    }
    return `${API_URL}/media/${thread.cover_img}`
  }
  // 기본 이미지 사용
  return '/logo.png'
}

// 이미지 로드 실패 핸들러
const handleImageError = (event, thread) => {
  console.warn('❌ [ThreadListView] 이미지 로드 실패:', thread.id)
  // 기본 이미지로 대체
  event.target.src = '/logo.png'
  // 에러 발생 시 더 이상 에러 이벤트가 발생하지 않도록 처리
  event.target.onerror = null
}

const selectCategory = (categoryName) => {
  selectedCategory.value = categoryName
}

const filteredThreads = computed(() => {
  if (!selectedCategory.value) return threads.value
  return threads.value.filter((thread) => thread.book.category_name === selectedCategory.value)
})

const goToThreadDetail = (threadId) => {
  router.push({ name: 'thread-detail', params: { id: threadId } })
}

const toggleLike = async (thread) => {
  try {
    // 애니메이션 시작
    startAnimation(thread.id)

    // Pinia store를 통한 좋아요 토글 (Optimistic UI 포함)
    await toggleThreadLike(thread.id)

    console.log('✅ [ThreadListView] 좋아요 토글 성공:', thread.id)
  } catch (error) {
    console.error('❌ [ThreadListView] 좋아요 토글 실패:', error)
    showErrorToast(error.message || '로그인 후 이용 가능합니다.')
  }
}
</script>

<style scoped>
.thread-list-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.category-filter {
  display: flex;
  gap: 8px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.category-filter button {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.category-filter button:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.category-filter button.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.thread-content {
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

.loading-spinner.small {
  width: 24px;
  height: 24px;
  border-width: 3px;
  margin-bottom: 8px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.thread-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.thread-item {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  background: white;
}

.thread-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.thread-item.highlight {
  animation: highlight-pulse 3s;
  box-shadow: 0 0 15px rgba(76, 175, 80, 0.8);
}

@keyframes highlight-pulse {
  0% {
    box-shadow: 0 0 15px rgba(76, 175, 80, 0.8);
  }
  70% {
    box-shadow: 0 0 15px rgba(76, 175, 80, 0.8);
  }
  100% {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

.thread-image {
  height: 180px;
  overflow: hidden;
}

.cover-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.thread-item:hover .cover-thumbnail {
  transform: scale(1.05);
}

.thread-info {
  padding: 20px;
  position: relative;
}

.thread-info h3 {
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.4;
}

.thread-info p {
  margin: 6px 0;
  color: #6b7280;
  font-size: 14px;
}

.thread-actions {
  margin-top: 16px;
}

.detail-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.detail-btn:hover {
  background: #2563eb;
}

.like-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px;
  border-radius: 20px;
  transition: all 0.2s;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
}

.like-btn:hover {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.05);
}

.like-btn.animate {
  animation: heartBeat 0.6s ease-in-out;
}

@keyframes heartBeat {
  0% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.2);
  }
  50% {
    transform: scale(1.1);
  }
  75% {
    transform: scale(1.15);
  }
  100% {
    transform: scale(1);
  }
}

.heart-icon {
  font-size: 18px;
  transition: all 0.3s ease;
}

.like-count {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  min-width: 16px;
  text-align: center;
}

.heart-enter-active,
.heart-leave-active {
  transition: all 0.3s ease;
}

.heart-enter-from {
  opacity: 0;
  transform: scale(0.5);
}

.heart-leave-to {
  opacity: 0;
  transform: scale(1.5);
}

.count-enter-active,
.count-leave-active {
  transition: all 0.2s ease;
}

.count-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.count-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.loading-more {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  color: #6b7280;
}

.end-message {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
  font-style: italic;
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
  margin: 20px 0;
  text-align: center;
}

.scroll-sentinel {
  height: 1px;
  width: 100%;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .thread-list {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .category-filter {
    gap: 6px;
  }

  .category-filter button {
    padding: 6px 12px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .thread-list-container {
    padding: 16px;
  }

  .thread-item {
    border-radius: 8px;
  }

  .thread-info {
    padding: 16px;
  }
}
</style>
