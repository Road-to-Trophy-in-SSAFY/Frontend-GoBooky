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
            <div class="book-author-info">
              <span class="author-label">저자</span>
              <span class="book-author">{{ book.author }}</span>
            </div>
            <div class="book-publisher-info">
              <span class="publisher-label">출판사</span>
              <span class="book-publisher">{{ book.publisher }}</span>
            </div>
            <div class="book-date-info">
              <span class="date-label">출간일</span>
              <span class="book-date">{{ formatDate(book.pub_date) }}</span>
            </div>
            <div v-if="book.isbn" class="book-isbn-info">
              <span class="isbn-label">ISBN</span>
              <span class="book-isbn">{{ book.isbn }}</span>
            </div>
          </div>

          <div v-if="book.description" class="book-description">
            <h3 class="description-title">책 소개</h3>
            <p class="description-text">{{ book.description }}</p>
          </div>
        </div>
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

        <div class="form-group">
          <label for="title" class="form-label">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M14 2V8H20"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
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
          <label for="content" class="form-label">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M14 2V8H20"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M16 13H8"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M16 17H8"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            내용
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

        <div class="form-group">
          <label for="reading_date" class="form-label">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="3"
                y="4"
                width="18"
                height="18"
                rx="2"
                ry="2"
                stroke="currentColor"
                stroke-width="2"
              />
              <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2" />
              <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2" />
              <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2" />
            </svg>
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

        <div class="form-actions">
          <button
            type="button"
            @click="showWriteModal = false"
            :disabled="isLoading"
            class="cancel-btn"
          >
            취소
          </button>
          <button
            type="button"
            @click="submitThread"
            :disabled="isLoading || !isFormValid"
            class="submit-btn"
          >
            <span v-if="!isLoading" class="submit-text">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 6L9 17L4 12"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
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
import { ref, computed, onMounted } from 'vue'
import { useBooks } from '@/composables/useBooks'
import { useThreads } from '@/composables/useThreads'
import { useAuthStore } from '@/stores/auth'
import { useRoute, useRouter } from 'vue-router'
import Modal from '@/components/Modal.vue'
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

// 쓰레드 작성 버튼 클릭 핸들러
const handleThreadWriteClick = () => {
  console.log('🔍 [BookDetailView] 인증 상태 확인:', {
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

onMounted(async () => {
  try {
    await fetchBook(route.params.id)
    if (book.value) {
      threadForm.value.book = book.value.id
    }
  } catch (error) {
    console.error('책 정보 로드 실패:', error)
  }
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

.book-author-info,
.book-publisher-info,
.book-date-info,
.book-isbn-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
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

.description-title::before {
  content: '📖';
  font-size: 20px;
}

.description-text {
  font-size: 15px;
  line-height: 1.7;
  color: #4b5563;
  margin: 0;
}

/* 모달 스타일 */
.thread-modal {
  max-width: 800px;
}

.thread-write-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.selected-book-info {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.selected-book-cover {
  flex-shrink: 0;
}

.selected-book-cover img {
  width: 60px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.selected-book-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}

.selected-book-title {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  line-height: 1.3;
}

.selected-book-author {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.form-input {
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s ease;
  background: white;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.editor-container {
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.2s ease;
}

.editor-container:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.cancel-btn,
.submit-btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.cancel-btn {
  background: white;
  color: #6b7280;
  border: 2px solid #e5e7eb;
}

.cancel-btn:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #d1d5db;
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
  background: #e5e7eb;
  color: #9ca3af;
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

  .book-author-info,
  .book-publisher-info,
  .book-date-info,
  .book-isbn-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    padding: 8px 0;
  }

  .author-label,
  .publisher-label,
  .date-label,
  .isbn-label {
    min-width: auto;
    font-size: 12px;
  }

  .form-actions {
    flex-direction: column;
  }

  .cancel-btn,
  .submit-btn {
    justify-content: center;
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
</style>
