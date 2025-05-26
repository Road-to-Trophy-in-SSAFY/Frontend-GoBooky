<template>
  <div>
    <BookCard v-for="book in books" :key="book.id" :book="book" />
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
/* */
</style>
