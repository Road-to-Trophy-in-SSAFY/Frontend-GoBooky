<template>
  <div class="book-detail-container">
    <!-- 로딩 상태 -->
    <div v-if="!book" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">책 정보를 불러오는 중입니다...</p>
    </div>

    <!-- 책 상세 정보 -->
    <div v-else class="book-detail-content">
      <!-- 책 헤더 섹션 -->
      <div class="book-header">
        <div class="book-cover-section">
          <div class="book-cover-wrapper">
            <img
              :src="bookCover"
              :alt="`${book.title} 표지`"
              @error="handleImageError"
              class="book-cover-image"
            />
            <div class="cover-overlay">
              <div class="cover-actions">
                <button
                  v-if="isAuthenticated"
                  @click="handleThreadWriteClick"
                  class="thread-write-btn"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M18.5 2.50023C18.8978 2.1024 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.1024 21.5 2.50023C21.8978 2.89805 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.1024 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  독서 기록 작성
                </button>
                <button v-else @click="goToLogin" class="login-prompt-btn">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M10 17L15 12L10 7"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M15 12H3"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  로그인 후 기록 작성
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="book-info-section">
          <div class="book-meta">
            <h1 class="book-title">{{ book.title }}</h1>
            <div class="book-details-grid">
              <div class="book-detail-item">
                <div class="detail-icon">👤</div>
                <div class="detail-content">
                  <span class="detail-label">저자</span>
                  <span class="detail-value">{{ book.author }}</span>
                </div>
              </div>
              <div class="book-detail-item">
                <div class="detail-icon">🏢</div>
                <div class="detail-content">
                  <span class="detail-label">출판사</span>
                  <span class="detail-value">{{ book.publisher }}</span>
                </div>
              </div>
              <div class="book-detail-item">
                <div class="detail-icon">📅</div>
                <div class="detail-content">
                  <span class="detail-label">출간일</span>
                  <span class="detail-value">{{ formatDate(book.pub_date) }}</span>
                </div>
              </div>
              <div v-if="book.isbn" class="book-detail-item">
                <div class="detail-icon">🔢</div>
                <div class="detail-content">
                  <span class="detail-label">ISBN</span>
                  <span class="detail-value">{{ book.isbn }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="book.description" class="book-description">
            <h3 class="description-title">
              <span class="description-icon">📖</span>
              책 소개
            </h3>
            <p class="description-text">{{ book.description }}</p>
          </div>
        </div>
      </div>
      <!-- 연관 도서 섹션 -->
      <div
        v-if="book && book.related_books && book.related_books.length > 0"
        class="related-books-section"
      >
        <RelatedBooks :related-books="book.related_books" />
      </div>
    </div>

    <!-- 쓰레드 작성 모달 -->
    <Modal
      :model-value="showWriteModal"
      @update:model-value="showWriteModal = $event"
      title="독서 기록 작성"
      :close-on-overlay-click="false"
      class="thread-modal"
    >
      <div class="thread-write-form">
        <div v-if="book" class="selected-book-info">
          <div class="selected-book-cover">
            <img :src="bookCover" :alt="`${book.title} 표지`" />
          </div>
          <div class="selected-book-details">
            <h4 class="selected-book-title">{{ book.title }}</h4>
            <p class="selected-book-author">{{ book.author }}</p>
          </div>
        </div>

        <div class="form-layout">
          <div class="form-left">
            <div class="form-group">
              <label for="title" class="form-label">
                <span class="label-icon">📝</span>
                제목
              </label>
              <input
                id="title"
                v-model="threadForm.title"
                type="text"
                required
                placeholder="독서 기록의 제목을 입력하세요"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="reading_date" class="form-label">
                <span class="label-icon">📅</span>
                독서 완료일
              </label>
              <input
                id="reading_date"
                v-model="threadForm.reading_date"
                type="date"
                required
                :max="today"
                class="form-input"
              />
            </div>
          </div>

          <div class="form-right">
            <div class="form-group content-group">
              <label for="content" class="form-label">
                <span class="label-icon">✍️</span>
                독서 후기
              </label>
              <QuillEditor
                v-model:content="threadForm.content"
                contentType="html"
                theme="snow"
                toolbar="essential"
                :options="editorOptions"
                class="editor-container"
              />
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button
            type="button"
            @click="showWriteModal = false"
            :disabled="isLoading"
            class="cancel-btn"
          >
            <span class="btn-icon">❌</span>
            취소
          </button>
          <button
            type="button"
            @click="submitThread"
            :disabled="isLoading || !isFormValid"
            class="submit-btn"
          >
            <span v-if="!isLoading" class="submit-text">
              <span class="btn-icon">✅</span>
              작성하기
            </span>
            <span v-else class="loading-text">
              <div class="submit-spinner"></div>
              작성 중...
            </span>
          </button>
        </div>
      </div>

      <!-- 로딩 오버레이 -->
      <div v-if="isLoading" class="loading-overlay">
        <div class="loading-content">
          <img src="/logo.png" alt="로딩 중" class="loading-logo" />
          <p class="loading-message">독서 기록을 저장하고 있습니다...</p>
          <div class="loading-progress">
            <div class="progress-bar"></div>
          </div>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useBooks } from '@/composables/useBooks'
import { useThreads } from '@/composables/useThreads'
import { useAuthStore } from '@/stores/auth'
import { useRoute, useRouter } from 'vue-router'
import Modal from '@/components/Modal.vue'
import RelatedBooks from '@/components/RelatedBooks.vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const { selectedBook, fetchBook } = useBooks()
const { createThread } = useThreads()
const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const book = computed(() => selectedBook.value)
const showWriteModal = ref(false)
const isLoading = ref(false)
const isBookLoading = ref(false)
const today = new Date().toISOString().split('T')[0]
const imageError = ref(false)

// 인증 상태
const isAuthenticated = computed(() => authStore.isAuthenticated)

// 책 표지 이미지 처리
const bookCover = computed(() => {
  if (imageError.value || !book.value?.cover) {
    return '/default-book-cover.jpg'
  }
  return book.value.cover
})

// 이미지 로드 에러 처리
const handleImageError = () => {
  imageError.value = true
}

// 날짜 포맷팅
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const threadForm = ref({
  title: '',
  content: '',
  reading_date: today,
  book: '',
})

const isFormValid = computed(() => {
  return (
    threadForm.value.title.trim() !== '' &&
    threadForm.value.content.trim() !== '' &&
    threadForm.value.reading_date !== ''
  )
})

const editorOptions = {
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ header: [1, 2, 3, false] }],
      ['link'],
      ['clean'],
    ],
  },
  placeholder: '독서 후 느낀 점이나 인상 깊었던 내용을 자유롭게 작성해보세요...',
}

// 로그인 페이지로 이동
const goToLogin = () => {
  router.push({ name: 'Login' })
}

// 책 정보를 불러오는 함수
const loadBookData = async (bookId) => {
  try {
    isBookLoading.value = true // 로딩 시작
    await fetchBook(bookId)
    if (book.value) {
      threadForm.value.book = book.value.id
    }
  } catch (error) {
    console.error('책 정보 로드 실패:', error)
  } finally {
    // 로딩 완료 후 약간의 지연을 두어 부드러운 전환 효과
    setTimeout(() => {
      isBookLoading.value = false // 로딩 완료
      // 스크롤을 최상단으로 이동
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 300)
  }
}

// 쓰레드 작성 버튼 클릭 핸들러
const handleThreadWriteClick = () => {
  console.log('📝 [BookDetailView] 인증 상태 확인:', {
    isAuthenticated: authStore.isAuthenticated,
    hasToken: !!authStore.accessToken,
    user: authStore.user?.email,
  })

  if (!authStore.isAuthenticated) {
    alert('로그인이 필요한 서비스입니다.')
    router.push({ name: 'Login' })
    return
  }
  // 로그인된 상태일 때만 모달 표시
  showWriteModal.value = true
}

// 라우트 파라미터가 변경될 때마다 책 정보를 다시 불러옴
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      loadBookData(newId)
      // 스크롤 이동은 loadBookData 내에서 처리
    }
  },
)

onMounted(() => {
  loadBookData(route.params.id)
})

const submitThread = async () => {
  try {
    console.log('📝 [BookDetailView] 쓰레드 작성 시작:', threadForm.value)
    console.log('🔍 [BookDetailView] 현재 인증 상태:', {
      isAuthenticated: authStore.isAuthenticated,
      hasToken: !!authStore.accessToken,
      user: authStore.user?.email,
    })

    isLoading.value = true
    const newThread = await createThread(threadForm.value)
    isLoading.value = false
    showWriteModal.value = false

    console.log('✅ [BookDetailView] 쓰레드 작성 성공:', newThread)

    // 쓰레드 작성 완료 후 생성된 쓰레드 상세 페이지로 이동
    if (newThread && newThread.id) {
      router.push({ name: 'thread-detail', params: { id: newThread.id } })
    } else {
      // 쓰레드 ID가 없으면 목록 페이지로 이동
      router.push({ name: 'threads' })
    }
  } catch (error) {
    isLoading.value = false
    console.error('❌ [BookDetailView] 쓰레드 작성 실패:', {
      error: error,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    })

    if (error.response?.status === 401) {
      alert('로그인이 만료되었습니다. 다시 로그인해주세요.')
      authStore.resetAuth()
      router.push({ name: 'Login' })
    } else {
      alert('쓰레드 작성에 실패했습니다. 다시 시도해주세요.')
    }
  }
}
</script>

<style scoped>
.book-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  min-height: calc(100vh - 140px);
}

/* 로딩 상태 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #6b7280;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.loading-text {
  font-size: 16px;
  font-weight: 500;
  margin: 0;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 책 상세 컨텐츠 */
.book-detail-content {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #f1f3f4;
}

.book-header {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 40px;
  padding: 40px;
}

/* 책 표지 섹션 */
.book-cover-section {
  position: relative;
}

.book-cover-wrapper {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease;
}

.book-cover-wrapper:hover {
  transform: translateY(-4px);
}

.book-cover-image {
  width: 100%;
  height: 400px;
  object-fit: cover;
  display: block;
}

.cover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.8) 100%);
  display: flex;
  align-items: flex-end;
  padding: 24px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.book-cover-wrapper:hover .cover-overlay {
  opacity: 1;
}

.cover-actions {
  width: 100%;
}

.thread-write-btn,
.login-prompt-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.thread-write-btn:hover,
.login-prompt-btn:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
}

.login-prompt-btn {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
}

.login-prompt-btn:hover {
  background: linear-gradient(135deg, #4b5563 0%, #374151 100%);
}

/* 책 정보 섹션 */
.book-info-section {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.book-meta {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.book-title {
  font-size: 32px;
  font-weight: 800;
  color: #1f2937;
  margin: 0;
  line-height: 1.2;
}

/* 책 상세 정보 그리드 */
.book-details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 24px;
}

.book-detail-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.book-detail-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: #cbd5e1;
}

.detail-icon {
  font-size: 24px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.detail-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

/* 페이드 애니메이션 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 로딩 인디케이터 스타일 */
.book-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  min-height: 300px;
}

.book-loading .loading-spinner {
  border: 5px solid #f3f3f3;
  border-top: 5px solid #4caf50;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 2s linear infinite;
  margin-bottom: 20px;
}

.book-error {
  text-align: center;
  padding: 40px;
  color: #d32f2f;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.author-label,
.publisher-label,
.date-label,
.isbn-label {
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  min-width: 80px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.book-author,
.book-publisher,
.book-date,
.book-isbn {
  font-size: 16px;
  font-weight: 500;
  color: #1f2937;
}

.book-description {
  background: #f8fafc;
  border-radius: 16px;
  padding: 24px;
  border-left: 4px solid #3b82f6;
}

.description-title {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.description-text {
  font-size: 15px;
  line-height: 1.7;
  color: #4b5563;
  margin: 0;
}

/* 책 설명 스타일 */
.book-description {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 20px;
  padding: 32px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.description-title {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.description-icon {
  font-size: 24px;
}

.description-text {
  font-size: 16px;
  line-height: 1.8;
  color: #475569;
  margin: 0;
}

/* 모달 스타일 */
.thread-modal {
  max-width: 1000px;
  width: 95vw;
}

.thread-write-form {
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 8px;
}

.selected-book-info {
  display: flex;
  gap: 20px;
  padding: 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.selected-book-cover {
  flex-shrink: 0;
}

.selected-book-cover img {
  width: 80px;
  height: 110px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.selected-book-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}

.selected-book-title {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  line-height: 1.3;
}

.selected-book-author {
  font-size: 15px;
  color: #64748b;
  margin: 0;
  font-weight: 500;
}

/* 폼 레이아웃 */
.form-layout {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 32px;
  min-height: 400px;
}

.form-left {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-right {
  display: flex;
  flex-direction: column;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.content-group {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
}

.label-icon {
  font-size: 18px;
}

.form-input {
  padding: 16px 20px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: white;
  font-weight: 500;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
  transform: translateY(-1px);
}

.editor-container {
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  flex: 1;
  min-height: 300px;
}

.editor-container:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
  transform: translateY(-1px);
}

.form-actions {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
  margin-top: 8px;
}

.cancel-btn,
.submit-btn {
  padding: 16px 32px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 140px;
  justify-content: center;
}

.btn-icon {
  font-size: 16px;
}

.cancel-btn {
  background: white;
  color: #64748b;
  border: 2px solid #e2e8f0;
}

.cancel-btn:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #cbd5e1;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.submit-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
}

.submit-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.submit-btn:disabled {
  background: #e2e8f0;
  color: #94a3b8;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.submit-text,
.loading-text {
  display: flex;
  align-items: center;
  gap: 6px;
}

.submit-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* 로딩 오버레이 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  border-radius: 12px;
}

.loading-content {
  text-align: center;
  color: #6b7280;
}

.loading-logo {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  margin-bottom: 16px;
  animation: pulse 2s infinite;
}

.loading-message {
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 20px 0;
}

.loading-progress {
  width: 200px;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
  margin: 0 auto;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
  border-radius: 2px;
  animation: progress 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@keyframes progress {
  0% {
    width: 0%;
    transform: translateX(-100%);
  }
  50% {
    width: 100%;
    transform: translateX(0%);
  }
  100% {
    width: 100%;
    transform: translateX(100%);
  }
}

/* 반응형 디자인 */
@media (max-width: 1024px) {
  .book-detail-container {
    padding: 20px;
  }

  .book-header {
    grid-template-columns: 250px 1fr;
    gap: 32px;
    padding: 32px;
  }

  .book-title {
    font-size: 28px;
  }
}

@media (max-width: 768px) {
  .book-detail-container {
    padding: 16px;
  }

  .book-header {
    grid-template-columns: 1fr;
    gap: 24px;
    padding: 24px;
  }

  .book-cover-section {
    display: flex;
    justify-content: center;
  }

  .book-cover-wrapper {
    max-width: 200px;
  }

  .book-cover-image {
    height: 280px;
  }

  .book-title {
    font-size: 24px;
    text-align: center;
  }

  .book-meta {
    gap: 12px;
  }

  .book-details-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .form-layout {
    grid-template-columns: 1fr;
    gap: 24px;
    min-height: auto;
  }

  .form-actions {
    flex-direction: column;
  }

  .cancel-btn,
  .submit-btn {
    justify-content: center;
  }

  .thread-modal {
    width: 98vw;
    max-width: none;
  }

  .related-books-section {
    padding: 24px;
    margin-top: 24px;
  }
}

@media (max-width: 480px) {
  .book-detail-container {
    padding: 12px;
  }

  .book-header {
    padding: 20px;
  }

  .book-title {
    font-size: 20px;
  }

  .description-text {
    font-size: 14px;
  }

  .thread-write-form {
    gap: 20px;
  }

  .selected-book-info {
    padding: 16px;
  }
}

/* 연관 도서 섹션 */
.related-books-section {
  margin-top: 40px;
  padding: 40px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}
</style>
