<template>
  <div class="book-list">
    <div class="book-grid">
      <BookCard v-for="book in books" :key="book.id" :book="book" />
    </div>
  </div>
</template>

<script setup>
import BookCard from '@/components/BookCard.vue'

defineProps({
  books: {
    type: Array,
    default: () => [],
  },
})
</script>

<style scoped>
.book-list {
  width: 100%;
}

.book-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  padding: 0;
}

/* 반응형 그리드 */
@media (max-width: 1200px) {
  .book-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .book-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .book-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>
