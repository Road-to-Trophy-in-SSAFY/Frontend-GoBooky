<template>
  <div class="related-books-container">
    <h3 class="related-books-title">연관 도서</h3>
    <div v-if="relatedBooks && relatedBooks.length > 0" class="related-books-grid">
      <div
        v-for="book in relatedBooks"
        :key="book.id"
        class="related-book-card"
        @click="navigateToBook(book.id)"
      >
        <div class="book-cover">
          <img :src="book.cover" :alt="book.title" />
        </div>
        <div class="book-info">
          <h4 class="book-title">{{ book.title }}</h4>
          <p class="book-author">{{ book.author }}</p>
        </div>
      </div>
    </div>
    <div v-else class="no-related-books">
      <p>연관 도서가 없습니다.</p>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

// Props 정의
const props = defineProps({
  relatedBooks: {
    type: Array,
    default: () => [],
  },
})

const router = useRouter()

// 책 상세 페이지로 이동하는 함수
const navigateToBook = (bookId) => {
  router.push({ name: 'book-detail', params: { id: bookId } })
  // 스크롤 이동은 BookDetailView에서 데이터 로딩 후 처리
}
</script>

<style scoped>
.related-books-container {
  margin-top: 40px;
  padding: 20px 0;
  border-top: 1px solid #eaeaea;
}

.related-books-title {
  font-size: 1.5rem;
  margin-bottom: 20px;
  color: #333;
}

.related-books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

.related-book-card {
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  cursor: pointer;
  height: 100%;
}

.related-book-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.book-cover {
  height: 250px;
  overflow: hidden;
}

.book-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.related-book-card:hover .book-cover img {
  transform: scale(1.05);
}

.book-info {
  padding: 15px;
  background-color: #fff;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.book-title {
  font-size: 1rem;
  margin: 0 0 8px 0;
  font-weight: 600;
  color: #333;
  /* 두 줄 이상은 말줄임표로 표시 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.book-author {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}

.no-related-books {
  padding: 20px;
  text-align: center;
  color: #666;
  background-color: #f9f9f9;
  border-radius: 8px;
}
</style>
