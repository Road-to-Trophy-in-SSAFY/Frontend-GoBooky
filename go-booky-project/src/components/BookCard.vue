<template>
  <div class="book-card" @click="goToBookDetail">
    <div class="book-cover" ref="cardRef">
      <!-- 이미지 로딩 스켈레톤 -->
      <div v-if="showSkeleton" class="image-skeleton">
        <div class="skeleton-shimmer"></div>
      </div>

      <!-- 실제 이미지 -->
      <img
        v-show="showActualImage"
        :src="bookCover"
        :alt="`${book.title} 표지`"
        @load="handleImageLoad"
        @error="handleImageError"
        class="cover-image"
        :class="{ 'fade-in': imageLoaded }"
      />

      <!-- 기본 이미지 (에러 시 또는 기본값) -->
      <img
        v-if="showDefaultImage"
        src="/default-book-cover.jpg"
        :alt="`${book.title} 기본 표지`"
        class="cover-image fade-in"
        @load="handleDefaultImageLoad"
      />

      <div class="cover-overlay">
        <span class="view-detail">자세히 보기</span>
      </div>
    </div>

    <div class="book-info">
      <h3 class="book-title">{{ book.title }}</h3>
      <p class="book-author">{{ book.author }}</p>
      <p class="book-publisher">{{ book.publisher }}</p>
      <div class="book-meta">
        <span class="book-category">{{ book.category_name }}</span>
        <span class="book-date">{{ formatDate(book.pub_date) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useIntersectionObserver } from '@vueuse/core'
import { useImageCache } from '@/composables/useImageCache'

const router = useRouter()
const { isCached } = useImageCache()
const props = defineProps({
  book: {
    type: Object,
    required: true,
  },
})

// 상태 관리
const cardRef = ref(null)
const imageError = ref(false)
const imageLoaded = ref(false)
const defaultImageLoaded = ref(false)
const isVisible = ref(false)

// 책 표지 이미지 URL 계산
const hasCustomCover = computed(() => {
  return props.book.cover && props.book.cover !== '/default-book-cover.jpg'
})

// Intersection Observer로 카드가 뷰포트에 들어왔을 때만 이미지 로드
const { stop } = useIntersectionObserver(
  cardRef,
  ([{ isIntersecting }]) => {
    if (isIntersecting) {
      isVisible.value = true
      // 캐시된 이미지 체크
      checkCachedImage()
      // 한 번 보이면 observer 중지 (성능 최적화)
      stop()
    }
  },
  {
    threshold: 0.1, // 10%만 보여도 로드 시작
    rootMargin: '50px', // 50px 미리 로드
  },
)

// 책 표지 이미지 처리 - 뷰포트에 들어왔을 때만 실제 이미지 URL 반환
const bookCover = computed(() => {
  if (!isVisible.value || !hasCustomCover.value) return ''
  return props.book.cover
})

// 표시할 이미지 상태 계산
const showSkeleton = computed(() => {
  // 커스텀 커버가 있고, 아직 로드되지 않았고, 에러도 없을 때만 스켈레톤 표시
  return hasCustomCover.value && isVisible.value && !imageLoaded.value && !imageError.value
})

const showActualImage = computed(() => {
  // 커스텀 커버가 있고, 로드 완료되었고, 에러가 없을 때
  return hasCustomCover.value && imageLoaded.value && !imageError.value
})

const showDefaultImage = computed(() => {
  // 커스텀 커버가 없거나, 에러가 발생했거나, 아직 뷰포트에 들어오지 않았을 때
  return !hasCustomCover.value || imageError.value || !isVisible.value
})

// 이미지 로드 완료 처리
const handleImageLoad = () => {
  imageLoaded.value = true
  imageError.value = false
}

// 기본 이미지 로드 완료 처리
const handleDefaultImageLoad = () => {
  defaultImageLoaded.value = true
}

// 이미지가 이미 캐시되어 있으면 즉시 로드 상태로 설정
const checkCachedImage = () => {
  const src = bookCover.value
  if (src && isCached(src)) {
    imageLoaded.value = true
    imageError.value = false
  }
}

// 이미지 로드 에러 처리
const handleImageError = () => {
  imageError.value = true
  imageLoaded.value = false
}

// 날짜 포맷팅
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const goToBookDetail = () => {
  router.push({ name: 'book-detail', params: { id: props.book.id } })
}

// book prop이 변경될 때만 상태 초기화
watch(
  () => props.book.id,
  () => {
    imageLoaded.value = false
    imageError.value = false
    defaultImageLoaded.value = false
    isVisible.value = false
  },
  { immediate: true },
)
</script>

<style scoped>
.book-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.book-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.book-cover {
  position: relative;
  height: 240px;
  overflow: hidden;
  background: #f8f9fa;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
  opacity: 0;
}

.cover-image.fade-in {
  opacity: 1;
}

.book-card:hover .cover-image {
  transform: scale(1.05);
}

/* 이미지 로딩 스켈레톤 */
.image-skeleton {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.skeleton-shimmer {
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.cover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.book-card:hover .cover-overlay {
  opacity: 1;
}

.view-detail {
  color: white;
  font-weight: 600;
  font-size: 14px;
  padding: 8px 16px;
  border: 2px solid white;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.view-detail:hover {
  background: white;
  color: #333;
}

.book-info {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.book-title {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.book-author {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  font-weight: 500;
}

.book-publisher {
  font-size: 13px;
  color: #9ca3af;
  margin: 0;
}

.book-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: auto;
  padding-top: 12px;
}

.book-category {
  display: inline-block;
  background: #e0f2fe;
  color: #0277bd;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  align-self: flex-start;
}

.book-date {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 400;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .book-cover {
    height: 200px;
  }

  .book-info {
    padding: 16px;
  }

  .book-title {
    font-size: 16px;
  }

  .book-author {
    font-size: 13px;
  }

  .book-publisher {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .book-cover {
    height: 180px;
  }

  .book-info {
    padding: 12px;
  }

  .book-title {
    font-size: 15px;
  }

  .view-detail {
    font-size: 12px;
    padding: 6px 12px;
  }
}
</style>
