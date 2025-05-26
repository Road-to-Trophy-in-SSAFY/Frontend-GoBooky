<template>
  <div class="book-search">
    <!-- 검색 폼 -->
    <div class="search-container">
      <form @submit.prevent="handleSearch" class="search-form">
        <div class="search-input-wrapper">
          <div class="search-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="도서명, 저자, 출판사로 검색하세요..."
            class="search-input"
            @keyup.enter="handleSearch"
            @input="onSearchInput"
          />
          <button v-if="searchQuery.trim()" type="button" @click="clearInput" class="clear-button">
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
        <button
          type="submit"
          class="search-button"
          :disabled="!searchQuery.trim()"
          :class="{ searching: isSearching }"
        >
          <span v-if="!isSearching" class="search-text">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            검색
          </span>
          <span v-else class="searching-text">
            <div class="search-spinner"></div>
            검색 중...
          </span>
        </button>
      </form>
    </div>

    <!-- 검색 결과 상태 표시 -->
    <div v-if="isSearchMode" class="search-status">
      <div class="search-result-info">
        <div class="search-term-display">
          <span class="search-icon-small">🔍</span>
          <span class="search-term">"{{ bookStore.filters.search }}"</span>
          <span class="search-label">검색 결과</span>
        </div>
        <div class="result-count">
          <span class="count-number">{{ bookStore.filteredBooks.length }}</span>
          <span class="count-label">권의 도서</span>
        </div>
      </div>
      <button @click="clearSearch" class="clear-search-button">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3 7V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V7M3 7L5 21H19L21 7M3 7H21M10 11V17M14 11V17"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        검색 초기화
      </button>
    </div>

    <!-- 검색 제안 (향후 확장용) -->
    <div v-if="showSuggestions && searchSuggestions.length > 0" class="search-suggestions">
      <div class="suggestions-header">추천 검색어</div>
      <div class="suggestions-list">
        <button
          v-for="suggestion in searchSuggestions"
          :key="suggestion"
          @click="applySuggestion(suggestion)"
          class="suggestion-item"
        >
          {{ suggestion }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useBookStore } from '@/stores/books'

const bookStore = useBookStore()
const searchQuery = ref('')
const isSearching = ref(false)
const showSuggestions = ref(false)
const searchSuggestions = ref([])

// 검색 모드 여부 확인
const isSearchMode = computed(() => {
  return bookStore.filters.search && bookStore.filters.search.trim() !== ''
})

/**
 * 검색 입력 처리
 */
const onSearchInput = () => {
  // 향후 실시간 검색 제안 기능 구현 시 사용
  showSuggestions.value = false
}

/**
 * 입력 필드 클리어
 */
const clearInput = () => {
  searchQuery.value = ''
  showSuggestions.value = false
}

/**
 * 검색 실행
 */
const handleSearch = async () => {
  const query = searchQuery.value.trim()
  if (!query) {
    console.log('❌ [BookSearch] 검색어가 비어있습니다')
    return
  }

  console.log('🔍 [BookSearch] 검색 실행:', query)

  isSearching.value = true
  showSuggestions.value = false

  try {
    // 검색 시 카테고리 필터 초기화 (전체 도서에서 검색)
    bookStore.setFilters({
      search: query,
      category: null,
    })

    console.log('✅ [BookSearch] 검색 필터 적용 완료')
  } catch (error) {
    console.error('❌ [BookSearch] 검색 실패:', error)
  } finally {
    isSearching.value = false
  }
}

/**
 * 검색 초기화 (전체 도서 목록 보기)
 */
const clearSearch = () => {
  console.log('🔄 [BookSearch] 검색 초기화')

  searchQuery.value = ''
  showSuggestions.value = false
  bookStore.setFilters({
    search: '',
    category: null,
  })

  console.log('✅ [BookSearch] 전체 도서 목록으로 복원')
}

/**
 * 검색 제안 적용
 */
const applySuggestion = (suggestion) => {
  searchQuery.value = suggestion
  handleSearch()
}

// 컴포넌트 마운트 시 기존 검색어가 있으면 input에 설정
if (bookStore.filters.search) {
  searchQuery.value = bookStore.filters.search
}
</script>

<style scoped>
.book-search {
  margin-bottom: 24px;
}

.search-container {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #f1f3f4;
}

.search-form {
  display: flex;
  gap: 12px;
  align-items: stretch;
}

.search-input-wrapper {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 16px;
  color: #9ca3af;
  z-index: 2;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 16px 16px 16px 48px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 16px;
  background: #fafbfc;
  transition: all 0.3s ease;
  outline: none;
}

.search-input:focus {
  border-color: #3b82f6;
  background: white;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.search-input::placeholder {
  color: #9ca3af;
  font-weight: 400;
}

.clear-button {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-button:hover {
  color: #6b7280;
  background: #f3f4f6;
}

.search-button {
  padding: 16px 24px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
  justify-content: center;
}

.search-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
}

.search-button:disabled {
  background: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.search-button.searching {
  background: #6b7280;
  cursor: wait;
}

.search-text,
.searching-text {
  display: flex;
  align-items: center;
  gap: 6px;
}

.search-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.search-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #bae6fd;
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(14, 165, 233, 0.1);
}

.search-result-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-term-display {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
}

.search-icon-small {
  font-size: 16px;
}

.search-term {
  font-weight: 700;
  color: #0369a1;
  background: white;
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid #bae6fd;
}

.search-label {
  color: #0369a1;
  font-weight: 500;
}

.result-count {
  display: flex;
  align-items: center;
  gap: 4px;
  background: white;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid #bae6fd;
}

.count-number {
  font-weight: 700;
  color: #0369a1;
  font-size: 18px;
}

.count-label {
  color: #0369a1;
  font-size: 14px;
}

.clear-search-button {
  padding: 8px 16px;
  background: white;
  color: #0369a1;
  border: 2px solid #bae6fd;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.clear-search-button:hover {
  background: #0369a1;
  color: white;
  border-color: #0369a1;
}

.search-suggestions {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  margin-top: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.suggestions-header {
  padding: 12px 16px;
  background: #f8f9fa;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  border-bottom: 1px solid #e5e7eb;
}

.suggestions-list {
  max-height: 200px;
  overflow-y: auto;
}

.suggestion-item {
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 14px;
  color: #374151;
}

.suggestion-item:hover {
  background: #f3f4f6;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .search-container {
    padding: 20px;
    border-radius: 12px;
  }

  .search-form {
    flex-direction: column;
    gap: 12px;
  }

  .search-input {
    padding: 14px 14px 14px 44px;
    font-size: 16px; /* iOS zoom 방지 */
  }

  .search-button {
    padding: 14px 20px;
    font-size: 15px;
  }

  .search-status {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
    padding: 16px;
  }

  .search-result-info {
    justify-content: center;
    flex-wrap: wrap;
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .search-container {
    padding: 16px;
  }

  .search-input {
    padding: 12px 12px 12px 40px;
    font-size: 16px;
  }

  .search-icon {
    left: 12px;
  }

  .clear-button {
    right: 8px;
  }

  .search-button {
    padding: 12px 16px;
    font-size: 14px;
    min-width: 100px;
  }

  .search-status {
    padding: 12px;
  }

  .search-term-display {
    font-size: 14px;
  }

  .count-number {
    font-size: 16px;
  }
}
</style>
