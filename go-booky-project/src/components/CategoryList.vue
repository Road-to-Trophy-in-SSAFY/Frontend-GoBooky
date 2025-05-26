<template>
  <div>
    <ul>
      <li v-for="category in categories" :key="category.pk">
        <button @click="selectCategory(category.pk)">{{ category.fields.name }}</button>
      </li>
      <li>
        <button @click="selectCategory(null)">전체</button>
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
    if (pk === null) {
      // 전체 카테고리 선택 시 모든 도서 조회
      const response = await fetchBooks()
      bookStore.setBooks(response.results || response)
      bookStore.setFilters({ category: null })
    } else {
      // 특정 카테고리 선택 시 해당 카테고리 도서 조회
      const response = await fetchBooksByCategory(pk)
      bookStore.setBooks(response.results || response)
      bookStore.setFilters({ category: pk })
    }
  } catch (error) {
    console.error('❌ [CategoryList] 카테고리 선택 실패:', error)
  }
}
</script>

<style scoped>
/* */
</style>
