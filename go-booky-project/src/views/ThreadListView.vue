<!-- 쓰레드 전체 목록 조회 view -->
<template>
  <div>
    <div class="header-actions"></div>

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
    <div v-if="filteredThreads.length > 0" class="thread-list">
      <div
        v-for="thread in filteredThreads"
        :key="thread.id"
        class="thread-item"
        :data-id="thread.id"
      >
        <div class="thread-image">
          <img :src="getThreadImage(thread)" alt="쓰레드 이미지" class="cover-thumbnail" />
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
    <div v-else>
      <p>쓰레드가 없습니다.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { categoriesData } from '@/stores/categoriesData.js'
import { useThreads } from '@/composables/useThreads'
import { useToast } from '@/composables/useToast'
import { useAnimation } from '@/composables/useAnimation'

// 지침에 따른 Composables 사용
const { threads, fetchThreads, toggleLike: toggleThreadLike } = useThreads()
const { error: showErrorToast } = useToast()
const { startAnimation, isAnimating } = useAnimation()
const router = useRouter()
const categories = categoriesData
const selectedCategory = ref(null)
const API_URL = 'http://127.0.0.1:8000'

onMounted(async () => {
  await loadThreads()
})

const loadThreads = async () => {
  try {
    await fetchThreads()
    console.log('✅ [ThreadListView] 쓰레드 목록 로드 완료')
  } catch (error) {
    console.error('❌ [ThreadListView] 쓰레드 목록 로드 실패:', error)
  }
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
    // 애니메이션 시작 (지침 준수: "비즈니스 로직은 훅으로")
    startAnimation(thread.id)

    await toggleThreadLike(thread.id)
    console.log('✅ [ThreadListView] 좋아요 토글 성공:', thread.id)
  } catch (error) {
    console.error('❌ [ThreadListView] 좋아요 토글 실패:', error)

    // 사용자에게 에러 알림 (지침 준수: "일관된 UX")
    showErrorToast(error.message || '로그인 후 이용 가능합니다.')
  }
}
</script>

<style scoped>
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.thread-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.thread-item {
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.thread-item:hover {
  transform: translateY(-5px);
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
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
}

.thread-info {
  padding: 15px;
}

.thread-info h3 {
  margin-top: 0;
  font-size: 18px;
}

.category-filter {
  margin-bottom: 20px;
}

.category-filter button {
  margin-right: 8px;
  padding: 6px 14px;
  border: 1px solid #aaa;
  background: #f7f7f7;
  cursor: pointer;
  border-radius: 4px;
}

.category-filter button.active {
  background: #4caf50;
  color: #fff;
  border-color: #4caf50;
}
.thread-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}
/* 좋아요 버튼 스타일 */
.like-btn {
  background-color: #f8f9fa;
  border: 2px solid #dee2e6;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  transition: all 0.3s ease;
  color: #495057;
}

.like-btn:hover {
  background-color: #e9ecef;
  border-color: #adb5bd;
  transform: translateY(-1px);
}

.like-btn.liked {
  background-color: #fff5f5;
  border-color: #fc8181;
  color: #e53e3e;
}

.like-btn.liked:hover {
  background-color: #fed7d7;
  border-color: #f56565;
}

/* 클릭 애니메이션 */
.like-btn.animate {
  animation: heartBeat 0.6s ease-in-out;
}

@keyframes heartBeat {
  0% {
    transform: scale(1);
  }
  14% {
    transform: scale(1.3);
  }
  28% {
    transform: scale(1);
  }
  42% {
    transform: scale(1.2);
  }
  70% {
    transform: scale(1);
  }
}

/* 하트 아이콘 애니메이션 */
.heart-icon {
  font-size: 18px;
  display: inline-block;
}

.heart-enter-active,
.heart-leave-active {
  transition: all 0.3s ease;
}

.heart-enter-from {
  opacity: 0;
  transform: scale(0) rotate(180deg);
}

.heart-leave-to {
  opacity: 0;
  transform: scale(0) rotate(-180deg);
}

.heart-enter-to,
.heart-leave-from {
  opacity: 1;
  transform: scale(1) rotate(0deg);
}

/* 좋아요 수 애니메이션 */
.like-count {
  font-weight: 600;
  font-size: 13px;
}

.count-enter-active,
.count-leave-active {
  transition: all 0.2s ease;
}

.count-enter-from {
  opacity: 0;
  transform: translateY(-8px) scale(1.2);
}

.count-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.8);
}

.count-enter-to,
.count-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.thread-actions {
  margin-bottom: 15px;
  text-align: right;
}

.refresh-btn {
  padding: 6px 14px;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.detail-btn {
  padding: 6px 12px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
}
</style>
