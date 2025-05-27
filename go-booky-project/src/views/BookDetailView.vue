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
                <!-- 나의 책 저장 토글 버튼 -->
                <button
                  v-if="isAuthenticated"
                  @click="toggleBookSave"
                  :disabled="isSaveLoading"
                  class="book-save-btn"
                  :class="{ saved: book.is_saved }"
                >
                  <svg
                    v-if="!isSaveLoading"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z"
                      :stroke="book.is_saved ? 'none' : 'currentColor'"
                      :fill="book.is_saved ? 'currentColor' : 'none'"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <div v-else class="save-spinner"></div>
                  {{ book.is_saved ? '저장됨' : '나의 책에 저장' }}
                </button>

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

          <!-- 책 상세 정보 -->
          <div class="book-details-vertical">
            <div class="book-detail-item-vertical">
              <div class="detail-icon">👤</div>
              <div class="detail-content-vertical">
                <span class="detail-label">저자</span>
                <span class="detail-value">{{ book.author }}</span>
              </div>
            </div>
            <div class="book-detail-item-vertical">
              <div class="detail-icon">🏢</div>
              <div class="detail-content-vertical">
                <span class="detail-label">출판사</span>
                <span class="detail-value">{{ book.publisher }}</span>
              </div>
            </div>
            <div class="book-detail-item-vertical">
              <div class="detail-icon">📅</div>
              <div class="detail-content-vertical">
                <span class="detail-label">출간일</span>
                <span class="detail-value">{{ formatDate(book.pub_date) }}</span>
              </div>
            </div>
            <div v-if="book.isbn" class="book-detail-item-vertical">
              <div class="detail-icon">🔢</div>
              <div class="detail-content-vertical">
                <span class="detail-label">ISBN</span>
                <span class="detail-value">{{ book.isbn }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="book-info-section">
          <div class="book-meta">
            <h1 class="book-title">{{ book.title }}</h1>
          </div>

          <div v-if="book.description" class="book-description">
            <h3 class="description-title">
              <span class="description-icon">📖</span>
              책 소개
            </h3>
            <p class="description-text">{{ book.description }}</p>
          </div>

          <!-- 오디오북 섹션 -->
          <div v-if="book.audiobook_url" class="audiobook-section">
            <h3 class="audiobook-title">
              <span class="audiobook-icon">🎧</span>
              오디오북
            </h3>
            <div class="audiobook-player">
              <audio
                :src="book.audiobook_url"
                controls
                preload="metadata"
                class="audio-player"
                @error="handleAudioError"
              >
                브라우저가 오디오 재생을 지원하지 않습니다.
              </audio>
              <div class="audiobook-info">
                <p class="audiobook-description">
                  <span class="info-icon">ℹ️</span>
                  AI가 생성한 이 책의 오디오북을 들어보세요
                </p>
              </div>
            </div>
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
        <!-- 선택된 책 정보 헤더 -->
        <div v-if="book" class="selected-book-header">
          <div class="book-info-card">
            <div class="book-cover-mini">
              <img :src="bookCover" :alt="`${book.title} 표지`" />
              <div class="book-badge">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
            </div>
            <div class="book-meta">
              <h4 class="book-title-mini">{{ book.title }}</h4>
              <p class="book-author-mini">{{ book.author }}</p>
              <div class="book-category">
                <span class="category-tag">{{ book.category_name || '미분류' }}</span>
              </div>
            </div>
          </div>
          <div class="form-progress">
            <div class="progress-steps">
              <div class="step" :class="{ active: threadForm.title.trim() || currentStep === 1 }">
                <span class="step-number">1</span>
                <span class="step-label">제목</span>
              </div>
              <div class="step" :class="{ active: threadForm.reading_date || currentStep === 2 }">
                <span class="step-number">2</span>
                <span class="step-label">날짜</span>
              </div>
              <div class="step" :class="{ active: threadForm.content.trim() || currentStep === 3 }">
                <span class="step-number">3</span>
                <span class="step-label">후기</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 메인 폼 영역 -->
        <div class="form-main">
          <!-- 기본 정보 섹션 -->
          <div class="form-section basic-info">
            <div class="section-header">
              <h5 class="section-title">
                <span class="section-icon">📋</span>
                기본 정보
              </h5>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="title" class="form-label">
                  <span class="label-icon">📝</span>
                  제목
                  <span class="required">*</span>
                </label>
                <input
                  id="title"
                  v-model="threadForm.title"
                  type="text"
                  required
                  placeholder="이 책을 읽고 느낀 점을 한 줄로 표현해보세요"
                  class="form-input"
                  maxlength="100"
                  @focus="currentStep = 1"
                  @blur="currentStep = 0"
                />
                <div class="input-helper">
                  <span class="char-count">{{ threadForm.title.length }}/100</span>
                </div>
              </div>

              <div class="form-group">
                <label for="reading_date" class="form-label">
                  <span class="label-icon">📅</span>
                  독서 완료일
                  <span class="required">*</span>
                </label>
                <input
                  id="reading_date"
                  v-model="threadForm.reading_date"
                  type="date"
                  required
                  :max="today"
                  class="form-input"
                  @focus="currentStep = 2"
                  @blur="currentStep = 0"
                />
                <div class="input-helper">
                  <span class="date-helper">언제 이 책을 다 읽으셨나요?</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 독서 후기 섹션 -->
          <div class="form-section content-section">
            <div class="section-header">
              <h5 class="section-title">
                <span class="section-icon">✍️</span>
                독서 후기
                <span class="required">*</span>
              </h5>
              <div class="section-tips">
                <div class="tip-item">
                  🎨 AI 이미지 생성을 위해 구체적인 장면 묘사를 포함해보세요
                </div>
                <div class="tip-item">💡 인상 깊었던 구절이나 감정을 상세히 표현해주세요</div>
                <div class="tip-item">
                  🌟 책의 분위기나 색감을 언급하면 더 생생한 이미지가 만들어집니다
                </div>
              </div>
            </div>
            <div class="editor-wrapper">
              <QuillEditor
                ref="quillEditor"
                v-model:content="threadForm.content"
                contentType="html"
                theme="snow"
                toolbar="essential"
                :options="editorOptions"
                class="editor-container"
                @focus="handleEditorFocus"
                @blur="handleEditorBlur"
              />
              <div class="editor-footer">
                <div class="editor-tips">
                  <span class="tip"
                    >🎨 AI 이미지 생성 팁: 책의 핵심 장면, 감정, 색감을 구체적으로 묘사하면 더
                    생생한 이미지가 생성됩니다</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 액션 버튼 -->
        <div class="form-actions">
          <div class="action-left">
            <div class="form-validation">
              <div v-if="!isFormValid" class="validation-message">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <span>모든 필수 항목을 입력해주세요</span>
              </div>
              <div v-else class="validation-message success">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <span>작성 준비 완료!</span>
              </div>
            </div>
          </div>
          <div class="action-buttons">
            <button
              type="button"
              @click="showWriteModal = false"
              :disabled="isLoading"
              class="cancel-btn"
            >
              <svg
                width="18"
                height="18"
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
              <span>취소</span>
            </button>
            <button
              type="button"
              @click="submitThread"
              :disabled="isLoading || !isFormValid"
              class="submit-btn"
            >
              <span v-if="!isLoading" class="submit-content">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 19L19 12L12 5M19 12H5"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <span>독서 기록 작성하기</span>
              </span>
              <span v-else class="loading-content">
                <div class="submit-spinner"></div>
                <span>작성 중...</span>
              </span>
            </button>
          </div>
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
import api from '@/api'

const { selectedBook, fetchBook } = useBooks()
const { createThread } = useThreads()
const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const book = computed(() => selectedBook.value)
const showWriteModal = ref(false)
const isLoading = ref(false)
const isBookLoading = ref(false)
const isSaveLoading = ref(false)
const today = new Date().toISOString().split('T')[0]
const imageError = ref(false)
const currentStep = ref(0)

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

// 오디오 로드 에러 처리
const handleAudioError = (event) => {
  console.error('오디오 로드 실패:', event)
  // 오디오 에러 시 사용자에게 알림 (선택사항)
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
  reading_date: '',
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
  placeholder:
    '이 책을 읽고 느낀 점을 자유롭게 작성해보세요... (AI 이미지 생성을 위해 구체적인 장면이나 감정을 포함해주세요)',
}

// Quill Editor 인스턴스 참조
const quillEditor = ref(null)
const isEditorFocused = ref(false)

// 에디터 포커스 핸들러
const handleEditorFocus = () => {
  isEditorFocused.value = true
  currentStep.value = 3

  // 포커스 시 placeholder 숨기기
  if (quillEditor.value && quillEditor.value.getQuill) {
    const quill = quillEditor.value.getQuill()
    const editor = quill.root
    if (editor) {
      editor.setAttribute('data-placeholder', '')
    }
  }
}

// 에디터 블러 핸들러
const handleEditorBlur = () => {
  isEditorFocused.value = false
  currentStep.value = 0

  // 블러 시 내용이 없으면 placeholder 복원
  if (quillEditor.value && quillEditor.value.getQuill) {
    const quill = quillEditor.value.getQuill()
    const editor = quill.root
    const isEmpty = quill.getText().trim() === ''

    if (editor && isEmpty) {
      editor.setAttribute('data-placeholder', editorOptions.placeholder)
    }
  }
}

// 로그인 페이지로 이동
const goToLogin = () => {
  router.push({ name: 'Login' })
}

// 책 저장 토글 (Optimistic UI)
const toggleBookSave = async () => {
  if (!authStore.isAuthenticated) {
    alert('로그인이 필요한 서비스입니다.')
    router.push({ name: 'Login' })
    return
  }

  if (!book.value) return

  // Optimistic UI: 즉시 UI 업데이트
  const originalIsSaved = book.value.is_saved
  const originalSavedCount = book.value.saved_count || 0

  // UI 즉시 업데이트
  book.value.is_saved = !originalIsSaved
  book.value.saved_count = originalIsSaved ? originalSavedCount - 1 : originalSavedCount + 1

  isSaveLoading.value = true

  try {
    // API 호출
    const response = await api.post(`/auth/auth/books/${book.value.id}/save/`)

    // 서버 응답으로 최종 상태 확정
    book.value.is_saved = response.data.is_saved
    book.value.saved_count = response.data.saved_count

    console.log('✅ [BookDetailView] 책 저장 토글 성공:', response.data)
  } catch (error) {
    // 실패 시 원래 상태로 롤백
    book.value.is_saved = originalIsSaved
    book.value.saved_count = originalSavedCount

    console.error('❌ [BookDetailView] 책 저장 토글 실패:', error)

    if (error.response?.status === 401) {
      alert('로그인이 만료되었습니다. 다시 로그인해주세요.')
      authStore.resetAuth()
      router.push({ name: 'Login' })
    } else {
      alert('책 저장에 실패했습니다. 다시 시도해주세요.')
    }
  } finally {
    isSaveLoading.value = false
  }
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

  // 모달이 열릴 때 에디터 상태 초기화
  setTimeout(() => {
    if (quillEditor.value && quillEditor.value.getQuill) {
      const quill = quillEditor.value.getQuill()
      const editor = quill.root
      if (editor) {
        // 내용이 비어있으면 placeholder 복원
        const isEmpty = quill.getText().trim() === ''
        if (isEmpty) {
          editor.setAttribute('data-placeholder', editorOptions.placeholder)
        }
      }
    }
  }, 100)
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

// 모달 상태 변경 감지
watch(showWriteModal, (isOpen) => {
  if (!isOpen) {
    // 모달이 닫힐 때 에디터 상태 리셋
    isEditorFocused.value = false
    currentStep.value = 0

    // 에디터 placeholder 복원
    setTimeout(() => {
      if (quillEditor.value && quillEditor.value.getQuill) {
        const quill = quillEditor.value.getQuill()
        const editor = quill.root
        if (editor) {
          const isEmpty = quill.getText().trim() === ''
          if (isEmpty) {
            editor.setAttribute('data-placeholder', editorOptions.placeholder)
          }
        }
      }
    }, 100)
  }
})

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

.book-save-btn,
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
  margin-bottom: 8px;
}

.book-save-btn:hover,
.thread-write-btn:hover,
.login-prompt-btn:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
}

.book-save-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.book-save-btn:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
}

.book-save-btn.saved {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.book-save-btn.saved:hover {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  box-shadow: 0 8px 25px rgba(245, 158, 11, 0.4);
}

.book-save-btn:disabled {
  background: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.save-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
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

/* 책 상세 정보 세로 배치 */
.book-details-vertical {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
}

.book-detail-item-vertical {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.book-detail-item-vertical:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border-color: #cbd5e1;
}

.detail-content-vertical {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detail-icon {
  font-size: 20px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
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

/* 오디오북 섹션 스타일 */
.audiobook-section {
  background: linear-gradient(135deg, #fef3e2 0%, #fde68a 100%);
  border-radius: 20px;
  padding: 32px;
  border: 1px solid #f59e0b;
  box-shadow: 0 4px 20px rgba(245, 158, 11, 0.1);
  margin-top: 24px;
}

.audiobook-title {
  font-size: 18px;
  font-weight: 700;
  color: #92400e;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.audiobook-icon {
  font-size: 20px;
}

.audiobook-player {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.audio-player {
  width: 100%;
  height: 54px;
  border-radius: 12px;
  background: white;
  border: 2px solid #f59e0b;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.2);
}

.audio-player:focus {
  outline: none;
  border-color: #d97706;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.2);
}

.audiobook-info {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.audiobook-description {
  margin: 0;
  font-size: 14px;
  color: #92400e;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.info-icon {
  font-size: 16px;
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
  white-space: pre-line;
}

/* 모달 스타일 */
.thread-modal {
  max-width: 1200px;
  width: 95vw;
}

.thread-write-form {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0;
}

/* 선택된 책 정보 헤더 */
.selected-book-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  margin: -32px -32px 0 -32px;
  border-radius: 16px 16px 0 0;
}

.book-info-card {
  display: flex;
  align-items: center;
  gap: 20px;
}

.book-cover-mini {
  position: relative;
  flex-shrink: 0;
}

.book-cover-mini img {
  width: 60px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.book-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.book-meta {
  flex: 1;
}

.book-title-mini {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 4px 0;
  line-height: 1.3;
  color: white;
}

.book-author-mini {
  font-size: 14px;
  margin: 0 0 8px 0;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.book-category {
  display: flex;
  gap: 8px;
}

.category-tag {
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* 진행 상황 표시 */
.form-progress {
  display: flex;
  align-items: center;
}

.progress-steps {
  display: flex;
  gap: 16px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  opacity: 0.5;
  transition: all 0.3s ease;
}

.step.active {
  opacity: 1;
  transform: scale(1.05);
}

.step-number {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: white;
  transition: all 0.3s ease;
}

.step.active .step-number {
  background: white;
  color: #667eea;
  border-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.step-label {
  font-size: 11px;
  font-weight: 600;
  color: white;
  text-align: center;
}

/* 메인 폼 영역 */
.form-main {
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* 폼 섹션 */
.form-section {
  background: white;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  transition: all 0.3s ease;
}

.form-section:hover {
  border-color: #d1d5db;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.section-header {
  padding: 20px 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 1px solid #e5e7eb;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 12px 0;
}

.section-icon {
  font-size: 20px;
}

.required {
  color: #ef4444;
  font-weight: 700;
  margin-left: 4px;
}

.section-tips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.tip-item {
  padding: 6px 12px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 20px;
  font-size: 13px;
  color: #1e40af;
  font-weight: 500;
}

/* 기본 정보 섹션 */
.basic-info {
  margin-bottom: 8px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  padding: 24px;
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
  font-size: 15px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 4px;
}

.label-icon {
  font-size: 16px;
}

.form-input {
  padding: 14px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 15px;
  transition: all 0.3s ease;
  background: white;
  font-weight: 500;
  color: #1f2937;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}

.form-input::placeholder {
  color: #9ca3af;
  font-weight: 400;
}

.input-helper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
}

.char-count {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.date-helper {
  font-size: 12px;
  color: #6b7280;
  font-style: italic;
}

/* 콘텐츠 섹션 */
.content-section {
  flex: 1;
}

.editor-wrapper {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 500px;
}

.editor-container {
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  min-height: 450px;
  background: white;
}

.editor-container:focus-within {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}

.editor-footer {
  margin-top: 8px;
}

.editor-tips {
  padding: 12px 16px;
  background: #f0f9ff;
  border-radius: 8px;
  border-left: 4px solid #0ea5e9;
}

.editor-tips .tip {
  font-size: 13px;
  color: #0c4a6e;
  font-weight: 500;
  margin: 0;
}

/* 액션 영역 */
.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  margin: 0 -32px -32px -32px;
  border-radius: 0 0 16px 16px;
}

.action-left {
  flex: 1;
}

.form-validation {
  display: flex;
  align-items: center;
}

.validation-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.validation-message.success {
  background: #f0fdf4;
  color: #16a34a;
  border-color: #bbf7d0;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.cancel-btn,
.submit-btn {
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
  justify-content: center;
  border: 2px solid transparent;
}

.cancel-btn {
  background: white;
  color: #6b7280;
  border-color: #d1d5db;
}

.cancel-btn:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.submit-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  position: relative;
  overflow: hidden;
}

.submit-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
}

.submit-btn:disabled {
  background: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.submit-content,
.loading-content {
  display: flex;
  align-items: center;
  gap: 8px;
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
    grid-template-columns: 280px 1fr;
    gap: 32px;
    padding: 32px;
  }

  .book-cover-wrapper {
    max-width: 100%;
  }

  .book-details-vertical {
    margin-top: 20px;
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
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding: 24px;
  }

  .book-cover-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  .book-cover-wrapper {
    max-width: 220px;
    width: 100%;
  }

  .book-cover-image {
    height: 300px;
  }

  .book-details-vertical {
    width: 100%;
    max-width: 400px;
    gap: 10px;
    margin-top: 0;
  }

  .book-detail-item-vertical {
    padding: 14px;
    gap: 10px;
  }

  .book-title {
    font-size: 24px;
    text-align: center;
  }

  /* 모달 반응형 - 태블릿 */
  .thread-modal {
    width: 98vw;
    max-width: none;
  }

  .selected-book-header {
    flex-direction: column;
    gap: 20px;
    padding: 20px 24px;
    margin: -24px -24px 0 -24px;
  }

  .book-info-card {
    justify-content: center;
  }

  .progress-steps {
    gap: 12px;
  }

  .form-main {
    padding: 24px;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 20px;
    padding: 20px;
  }

  .section-header {
    padding: 16px 20px;
  }

  .section-title {
    font-size: 16px;
  }

  .editor-wrapper {
    padding: 20px;
    min-height: 450px;
  }

  .editor-container {
    min-height: 400px;
  }

  .form-actions {
    flex-direction: column;
    gap: 16px;
    padding: 20px 24px;
    margin: 0 -24px -24px -24px;
  }

  .action-left {
    order: 2;
  }

  .action-buttons {
    order: 1;
    width: 100%;
  }

  .cancel-btn,
  .submit-btn {
    flex: 1;
  }

  .book-meta {
    gap: 12px;
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

  .audiobook-section {
    padding: 24px;
    margin-top: 20px;
  }

  .audiobook-title {
    font-size: 16px;
  }

  .audio-player {
    height: 48px;
  }
}

@media (max-width: 480px) {
  .book-detail-container {
    padding: 12px;
  }

  .book-header {
    padding: 16px;
    gap: 20px;
  }

  .book-cover-section {
    gap: 16px;
  }

  .book-cover-wrapper {
    max-width: 180px;
  }

  .book-cover-image {
    height: 240px;
  }

  .book-details-vertical {
    max-width: 100%;
    gap: 8px;
    margin-top: 0;
  }

  .book-detail-item-vertical {
    padding: 12px;
    gap: 8px;
  }

  .detail-icon {
    font-size: 16px;
    width: 32px;
    height: 32px;
  }

  .detail-label {
    font-size: 11px;
  }

  .detail-value {
    font-size: 14px;
  }

  .book-title {
    font-size: 20px;
  }

  .description-text {
    font-size: 14px;
  }

  .audiobook-section {
    padding: 20px;
    margin-top: 16px;
  }

  .audiobook-title {
    font-size: 15px;
  }

  /* 모달 반응형 - 모바일 */
  .selected-book-header {
    padding: 16px 20px;
    margin: -20px -20px 0 -20px;
  }

  .book-cover-mini img {
    width: 50px;
    height: 70px;
  }

  .book-badge {
    width: 20px;
    height: 20px;
    top: -4px;
    right: -4px;
  }

  .book-badge svg {
    width: 12px;
    height: 12px;
  }

  .book-title-mini {
    font-size: 16px;
  }

  .book-author-mini {
    font-size: 13px;
  }

  .category-tag {
    padding: 3px 8px;
    font-size: 11px;
  }

  .step-number {
    width: 24px;
    height: 24px;
    font-size: 11px;
  }

  .step-label {
    font-size: 10px;
  }

  .form-main {
    padding: 20px;
  }

  .section-header {
    padding: 14px 16px;
  }

  .section-title {
    font-size: 15px;
  }

  .section-tips {
    flex-direction: column;
    gap: 6px;
  }

  .tip-item {
    padding: 5px 10px;
    font-size: 12px;
  }

  .form-row {
    padding: 16px;
    gap: 16px;
  }

  .form-label {
    font-size: 14px;
  }

  .form-input {
    padding: 12px 14px;
    font-size: 14px;
  }

  .input-helper {
    margin-top: 2px;
  }

  .char-count,
  .date-helper {
    font-size: 11px;
  }

  .editor-wrapper {
    padding: 16px;
    min-height: 400px;
  }

  .editor-container {
    min-height: 350px;
  }

  .editor-tips {
    padding: 10px 12px;
  }

  .editor-tips .tip {
    font-size: 12px;
  }

  .form-actions {
    padding: 16px 20px;
    margin: 0 -20px -20px -20px;
  }

  .validation-message {
    padding: 6px 12px;
    font-size: 13px;
    justify-content: center;
    text-align: center;
  }

  .cancel-btn,
  .submit-btn {
    padding: 10px 20px;
    font-size: 14px;
    min-width: 100px;
  }

  .audio-player {
    height: 44px;
  }

  .audiobook-description {
    font-size: 13px;
  }

  .thread-write-form {
    gap: 20px;
  }

  .selected-book-info {
    padding: 16px;
  }
}

@media (max-width: 360px) {
  .book-detail-container {
    padding: 8px;
  }

  .book-header {
    padding: 12px;
    gap: 16px;
  }

  .book-cover-wrapper {
    max-width: 160px;
  }

  .book-cover-image {
    height: 220px;
  }

  .book-details-vertical {
    gap: 6px;
  }

  .book-detail-item-vertical {
    padding: 10px;
    gap: 6px;
  }

  .detail-icon {
    font-size: 14px;
    width: 28px;
    height: 28px;
  }

  .detail-label {
    font-size: 10px;
  }

  .detail-value {
    font-size: 13px;
  }

  .book-title {
    font-size: 18px;
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

<style>
/* QuillEditor 전역 스타일 - scoped 없이 적용 */
.editor-container .ql-container {
  min-height: 380px !important;
  font-size: 15px;
}

.editor-container .ql-editor {
  min-height: 380px !important;
  padding: 20px !important;
  line-height: 1.6 !important;
  font-size: 15px;
}

.editor-container .ql-toolbar {
  border-bottom: 1px solid #e5e7eb;
  padding: 12px 16px;
}

/* Placeholder 커스텀 스타일 */
.editor-container .ql-editor.ql-blank::before {
  color: #9ca3af !important;
  font-style: italic !important;
  font-weight: 400 !important;
  opacity: 1 !important;
  transition: opacity 0.2s ease !important;
}

/* 포커스 시 placeholder 숨기기 */
.editor-container .ql-editor:focus.ql-blank::before {
  opacity: 0 !important;
}

/* 에디터가 포커스되었을 때 placeholder 완전히 숨기기 */
.editor-container .ql-editor[data-placeholder='']::before {
  content: '' !important;
  opacity: 0 !important;
}

/* 태블릿 반응형 */
@media (max-width: 768px) {
  .editor-container .ql-container {
    min-height: 330px !important;
  }

  .editor-container .ql-editor {
    min-height: 330px !important;
    padding: 18px !important;
    font-size: 14px;
  }
}

/* 모바일 반응형 */
@media (max-width: 480px) {
  .editor-container .ql-container {
    min-height: 280px !important;
  }

  .editor-container .ql-editor {
    min-height: 280px !important;
    padding: 16px !important;
    font-size: 14px;
  }
}
</style>
