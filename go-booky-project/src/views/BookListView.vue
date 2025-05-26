<template>
  <div>
    <div class="search-bar">
      <BookSearch />
    </div>
    <div class="sidebar">
      <Category />
    </div>
    <div class="content">
      <BookList :books="bookStore.filteredBooks" />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useBookStore } from '@/stores/books.js'
import BookList from '@/components/BookList.vue'
import Category from '@/components/CategoryList.vue'
import BookSearch from '@/components/BookSearch.vue'
import { useBooks } from '@/composables/useBooks'

// 지침에 따른 Composables 사용
const { fetchBooks } = useBooks()
const bookStore = useBookStore()

onMounted(async () => {
  try {
    const response = await fetchBooks()
    // useBooks에서 가져온 데이터를 bookStore에 설정
    bookStore.setBooks(response.results || response)
    console.log('✅ [BookListView] 도서 목록 로드 완료')
  } catch (error) {
    console.error('❌ [BookListView] 도서 목록 로드 실패:', error)
  }
})
</script>

<style scoped>
.search-bar {
  margin-bottom: 20px;
}

.sidebar {
  margin-bottom: 20px;
}

.content {
  margin-top: 10px;
}

/* 반응형 레이아웃 */
@media (min-width: 768px) {
  /* 데스크톱에서는 사이드바와 컨텐츠를 나란히 배치할 수 있음 */
  .container {
    display: flex;
    gap: 20px;
  }

  .sidebar {
    flex: 0 0 250px;
  }

  .content {
    flex: 1;
  }
}
</style>
