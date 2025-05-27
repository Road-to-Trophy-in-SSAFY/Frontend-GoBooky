<template>
  <div class="category-list">
    <div class="category-header">
      <h3 class="category-title">
        <span class="icon">📚</span>
        카테고리
      </h3>
    </div>

    <div class="category-grid">
      <button
        @click="selectCategory(null)"
        :class="{ active: bookStore.filters.category === null }"
        class="category-button all-category"
      >
        <span class="category-icon">🌟</span>
        <span class="category-name">전체</span>
      </button>

      <button
        v-for="category in categories"
        :key="category.pk"
        @click="selectCategory(category.pk)"
        :class="{ active: bookStore.filters.category === category.pk }"
        class="category-button"
      >
        <span class="category-icon">{{ getCategoryIcon(category.fields.name) }}</span>
        <span class="category-name">{{ category.fields.name }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { useCategoryStore } from '@/stores/category.js'
import { computed } from 'vue'
import { useBookStore } from '@/stores/books.js'
import { useBooks } from '@/composables/useBooks'
import { useRouter, useRoute } from 'vue-router'

defineOptions({
  name: 'CategoryList',
})

const categoryStore = useCategoryStore()
const categories = computed(() => categoryStore.categories)
const bookStore = useBookStore()
const { fetchBooksByCategory, fetchBooks } = useBooks()
const router = useRouter()
const route = useRoute()

// 카테고리별 아이콘 매핑
const getCategoryIcon = (categoryName) => {
  const iconMap = {
    '소설/시/희곡': '📖',
    '경제/경영': '💼',
    자기계발: '🚀',
    '인문/교양': '🎓',
    '취미/실용': '🎨',
    '어린이/청소년': '🧸',
    과학: '🔬',
    역사: '📜',
    종교: '⛪',
    예술: '🎭',
    여행: '✈️',
    요리: '👨‍🍳',
    건강: '💪',
    '컴퓨터/IT': '💻',
  }
  return iconMap[categoryName] || '📚'
}

async function selectCategory(pk) {
  try {
    console.log('📂 [CategoryList] 카테고리 선택:', pk)

    // 스토어에 필터 설정
    bookStore.setFilters({
      category: pk,
      search: bookStore.filters.search, // 검색어는 유지
    })

    // URL 업데이트 (페이지를 1로 리셋, 검색어는 유지)
    const newQuery = { ...route.query }

    if (pk === null) {
      // 전체 카테고리 선택 시 category 파라미터 제거
      delete newQuery.category
    } else {
      // 특정 카테고리 선택 시 category 파라미터 설정
      newQuery.category = pk
    }

    // 페이지를 1로 리셋 (검색어가 있을 때만)
    if (bookStore.filters.search) {
      newQuery.page = '1'
    } else {
      // 검색어가 없으면 페이지도 1로 리셋
      newQuery.page = '1'
    }

    // 라우터로 URL 업데이트 (이렇게 하면 BookListView의 watch가 트리거됨)
    await router.push({
      query: newQuery,
    })

    console.log('✅ [CategoryList] 카테고리 선택 및 URL 업데이트 완료:', {
      category: pk,
      search: bookStore.filters.search,
      newQuery,
    })
  } catch (error) {
    console.error('❌ [CategoryList] 카테고리 선택 실패:', error)
  }
}
</script>

<style scoped>
.category-list {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #f1f3f4;
}

.category-header {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f8f9fa;
}

.category-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
}

.category-title .icon {
  font-size: 20px;
}

.category-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.category-button {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  background: white;
  color: #374151;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  text-align: left;
  width: 100%;
  position: relative;
  overflow: hidden;
}

.category-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
  transition: left 0.5s ease;
}

.category-button:hover::before {
  left: 100%;
}

.category-button:hover {
  border-color: #3b82f6;
  background: #f8faff;
  transform: translateX(4px);
}

.category-button.active {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.category-button.all-category.active {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border-color: #f59e0b;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.category-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.category-name {
  font-weight: 600;
  flex: 1;
}

.category-button.active .category-name {
  font-weight: 700;
}

/* 반응형 디자인 */
@media (max-width: 1024px) {
  .category-list {
    padding: 20px;
  }

  .category-title {
    font-size: 16px;
  }
}

@media (max-width: 768px) {
  .category-list {
    padding: 16px;
    border-radius: 12px;
  }

  .category-header {
    margin-bottom: 16px;
    padding-bottom: 12px;
  }

  .category-title {
    font-size: 15px;
  }

  .category-button {
    padding: 10px 14px;
    font-size: 13px;
    gap: 10px;
  }

  .category-icon {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .category-list {
    padding: 12px;
  }

  .category-button {
    padding: 8px 12px;
    font-size: 12px;
    gap: 8px;
  }

  .category-icon {
    font-size: 14px;
  }
}

/* 애니메이션 */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.category-button {
  animation: slideIn 0.3s ease forwards;
}

.category-button:nth-child(1) {
  animation-delay: 0.1s;
}
.category-button:nth-child(2) {
  animation-delay: 0.15s;
}
.category-button:nth-child(3) {
  animation-delay: 0.2s;
}
.category-button:nth-child(4) {
  animation-delay: 0.25s;
}
.category-button:nth-child(5) {
  animation-delay: 0.3s;
}
.category-button:nth-child(6) {
  animation-delay: 0.35s;
}
.category-button:nth-child(7) {
  animation-delay: 0.4s;
}
.category-button:nth-child(8) {
  animation-delay: 0.45s;
}
</style>
