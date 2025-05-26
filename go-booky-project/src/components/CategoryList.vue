<template>
  <div class="category-list">
    <ul>
      <li>
        <button
          @click="selectCategory(null)"
          :class="{ active: bookStore.filters.category === null }"
          class="category-button"
        >
          전체
        </button>
      </li>
      <li v-for="category in categories" :key="category.pk">
        <button
          @click="selectCategory(category.pk)"
          :class="{ active: bookStore.filters.category === category.pk }"
          class="category-button"
        >
          {{ category.fields.name }}
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { useCategoryStore } from '@/stores/category.js'
import { computed } from 'vue'
import { useBookStore } from '@/stores/books.js'
import { useBooks } from '@/composables/useBooks'

defineOptions({
  name: 'CategoryList',
})

const categoryStore = useCategoryStore()
const categories = computed(() => categoryStore.categories)
const bookStore = useBookStore()
const { fetchBooksByCategory, fetchBooks } = useBooks()

async function selectCategory(pk) {
  try {
    const isSearchMode = bookStore.filters.search && bookStore.filters.search.trim() !== ''

    if (isSearchMode) {
      // 검색 모드일 때는 검색어를 유지하고 카테고리 필터만 변경
      console.log('🔍 [CategoryList] 검색 모드에서 카테고리 필터링:', pk)
      bookStore.setFilters({
        search: bookStore.filters.search, // 검색어 유지
        category: pk,
      })
    } else {
      // 일반 모드일 때는 기존 로직 유지
      if (pk === null) {
        // 전체 카테고리 선택 시 모든 도서 조회
        console.log('📚 [CategoryList] 전체 도서 조회')
        const response = await fetchBooks()
        bookStore.setBooks(response.results || response)
        bookStore.setFilters({ category: null, search: '' })
      } else {
        // 특정 카테고리 선택 시 해당 카테고리 도서 조회
        console.log('📂 [CategoryList] 카테고리별 도서 조회:', pk)
        const response = await fetchBooksByCategory(pk)
        bookStore.setBooks(response.results || response)
        bookStore.setFilters({ category: pk, search: '' })
      }
    }

    console.log('✅ [CategoryList] 카테고리 선택 완료')
  } catch (error) {
    console.error('❌ [CategoryList] 카테고리 선택 실패:', error)
  }
}
</script>

<style scoped>
.category-list {
  margin-bottom: 20px;
}

.category-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.category-list li {
  margin: 0;
}

.category-button {
  padding: 8px 16px;
  border: 2px solid #e1e5e9;
  background-color: #ffffff;
  color: #495057;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.category-button:hover {
  border-color: #4caf50;
  background-color: #f8f9fa;
}

.category-button.active {
  border-color: #4caf50;
  background-color: #4caf50;
  color: white;
}

.category-button.active:hover {
  background-color: #45a049;
  border-color: #45a049;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .category-list ul {
    justify-content: center;
  }

  .category-button {
    font-size: 12px;
    padding: 6px 12px;
  }
}
</style>
