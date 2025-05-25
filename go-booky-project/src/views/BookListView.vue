<template>
  <div>
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
import { useBooks } from '@/composables/useBooks'

// 지침에 따른 Composables 사용
const { fetchBooks } = useBooks()
const bookStore = useBookStore()

onMounted(async () => {
  try {
    await fetchBooks()
    console.log('✅ [BookListView] 도서 목록 로드 완료')
  } catch (error) {
    console.error('❌ [BookListView] 도서 목록 로드 실패:', error)
  }
})
</script>

<style scoped>
/* */
</style>
