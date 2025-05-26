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
          <img
            :src="getBookCover(book)"
            :alt="book.title"
            @error="handleImageError($event, book)"
            class="book-cover-image"
          />
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'

// Props 정의
defineProps({
  relatedBooks: {
    type: Array,
    default: () => [],
  },
})

const router = useRouter()

// 이미지 오류 상태 관리
const imageErrors = ref(new Set())

// 기본 대체 이미지 URL
const DEFAULT_BOOK_COVER = '/default-book-cover.jpg'

// 책 표지 이미지 URL 반환 함수
const getBookCover = (book) => {
  // 이미지 오류가 발생한 책이거나 cover가 없는 경우 기본 이미지 반환
  if (imageErrors.value.has(book.id) || !book.cover) {
    return DEFAULT_BOOK_COVER
  }
  return book.cover
}

// 이미지 로드 오류 처리 함수
const handleImageError = (event, book) => {
  console.warn(`📚 [RelatedBooks] 이미지 로드 실패: ${book.title}`)

  // 오류 발생한 책 ID를 Set에 추가
  imageErrors.value.add(book.id)

  // 이미지 src를 기본 이미지로 변경
  event.target.src = DEFAULT_BOOK_COVER
}

// 책 상세 페이지로 이동하는 함수
const navigateToBook = (bookId) => {
  router.push({ name: 'book-detail', params: { id: bookId } })
  // 스크롤 이동은 BookDetailView에서 데이터 로딩 후 처리
}
</script>

<style scoped>
.related-books-container {
  width: 100%;
}

.related-books-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 32px;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 12px;
}

.related-books-title::before {
  content: '📚';
  font-size: 28px;
}

.related-books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px;
}

.related-book-card {
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  overflow: hidden;
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  cursor: pointer;
  height: 100%;
}

.related-book-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  border-color: #cbd5e1;
}

.book-cover {
  height: 280px;
  overflow: hidden;
  position: relative;
}

.book-cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
  background-color: #f8fafc;
}

.related-book-card:hover .book-cover-image {
  transform: scale(1.08);
}

/* 기본 이미지 스타일 */
.book-cover-image[src*='default-book-cover'] {
  object-fit: contain;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  padding: 24px;
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
  line-clamp: 2;
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
  padding: 40px;
  text-align: center;
  color: #64748b;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  font-size: 16px;
  font-weight: 500;
}
</style>
