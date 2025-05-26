<template>
  <div class="book-search">
    <!-- 검색 폼 -->
    <form @submit.prevent="handleSearch" class="search-form">
      <div class="search-input-group">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="도서명, 저자, 내용으로 검색하세요..."
          class="search-input"
          @keyup.enter="handleSearch"
        />
        <button type="submit" class="search-button" :disabled="!searchQuery.trim()">🔍 검색</button>
      </div>
    </form>

    <!-- 검색 결과 상태 표시 -->
    <div v-if="isSearchMode" class="search-status">
      <div class="search-info">
        <span class="search-term">"{{ bookStore.filters.search }}"</span> 검색 결과
        <span class="result-count">({{ bookStore.filteredBooks.length }}권)</span>
      </div>
      <button @click="clearSearch" class="clear-search-button">📚 전체 도서 목록 보기</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useBookStore } from '@/stores/books'

const bookStore = useBookStore()
const searchQuery = ref('')

// 검색 모드 여부 확인
const isSearchMode = computed(() => {
  return bookStore.filters.search && bookStore.filters.search.trim() !== ''
})

/**
 * 검색 실행
 */
const handleSearch = () => {
  const query = searchQuery.value.trim()
  if (!query) {
    console.log('❌ [BookSearch] 검색어가 비어있습니다')
    return
  }

  console.log('🔍 [BookSearch] 검색 실행:', query)

  // 검색 시 카테고리 필터 초기화 (전체 도서에서 검색)
  bookStore.setFilters({
    search: query,
    category: null,
  })

  console.log('✅ [BookSearch] 검색 필터 적용 완료')
}

/**
 * 검색 초기화 (전체 도서 목록 보기)
 */
const clearSearch = () => {
  console.log('🔄 [BookSearch] 검색 초기화')

  searchQuery.value = ''
  bookStore.setFilters({
    search: '',
    category: null,
  })

  console.log('✅ [BookSearch] 전체 도서 목록으로 복원')
}

// 컴포넌트 마운트 시 기존 검색어가 있으면 input에 설정
if (bookStore.filters.search) {
  searchQuery.value = bookStore.filters.search
}
</script>

<style scoped>
.book-search {
  margin-bottom: 20px;
}

.search-form {
  margin-bottom: 15px;
}

.search-input-group {
  display: flex;
  gap: 10px;
  max-width: 600px;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #4caf50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

.search-button {
  padding: 12px 20px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  white-space: nowrap;
}

.search-button:hover:not(:disabled) {
  background-color: #45a049;
}

.search-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.search-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  margin-bottom: 10px;
}

.search-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #495057;
}

.search-term {
  font-weight: bold;
  color: #4caf50;
}

.result-count {
  color: #6c757d;
}

.clear-search-button {
  padding: 8px 16px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.clear-search-button:hover {
  background-color: #5a6268;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .search-input-group {
    flex-direction: column;
  }

  .search-status {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }

  .search-info {
    justify-content: center;
  }
}
</style>
