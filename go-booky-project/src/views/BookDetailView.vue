<template>
  <div class="book-detail-container">
    <div class="book-header">
      <!-- 쓰레드 작성 버튼 -->
      <button
        v-if="book && !isBookLoading"
        @click="handleThreadWriteClick"
        class="thread-write-btn"
      >
        쓰레드 작성
      </button>
    </div>

    <!-- 로딩 인디케이터 -->
    <div v-if="isBookLoading" class="book-loading">
      <div class="loading-spinner"></div>
      <p>책 정보를 불러오는 중입니다...</p>
    </div>

    <!-- 페이드 인/아웃 애니메이션 적용 -->
    <transition name="fade" mode="out-in">
      <div v-if="book && !isBookLoading" class="book-content" :key="book.id">
        <p>{{ book.title }}</p>
        <p>{{ book.author }}</p>
        <p>{{ book.publisher }}</p>
        <p>{{ book.pub_date }}</p>
        <img :src="book.cover" alt="Book Cover" />
        <p>{{ book.description }}</p>
        <p>ISBN: {{ book.isbn }}</p>

        <!-- 연관 도서 컴포넌트 추가 -->
        <RelatedBooks :related-books="book.related_books" />
      </div>
      <div v-else-if="!isBookLoading && !book" class="book-error">
        <p>책 정보를 불러올 수 없습니다.</p>
      </div>
    </transition>

    <!-- 쓰레드 작성 모달 -->
    <Modal
      :model-value="showWriteModal"
      @update:model-value="showWriteModal = $event"
      title="쓰레드 작성"
      :close-on-overlay-click="false"
    >
      <div class="thread-write-form">
        <div v-if="book" class="book-info">
          <h3>책 정보</h3>
          <p>제목: {{ book.title }}</p>
          <p>저자: {{ book.author }}</p>
        </div>

        <div class="form-group">
          <label for="title">제목</label>
          <input
            id="title"
            v-model="threadForm.title"
            type="text"
            required
            placeholder="제목을 입력하세요"
          />
        </div>

        <div class="form-group">
          <label for="content">내용</label>
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
          <label for="reading_date">독서일</label>
          <input
            id="reading_date"
            v-model="threadForm.reading_date"
            type="date"
            required
            :max="today"
          />
        </div>

        <div class="form-actions">
          <button type="button" @click="showWriteModal = false" :disabled="isLoading">취소</button>
          <button type="button" @click="submitThread" :disabled="isLoading || !isFormValid">
            {{ isLoading ? '작성 중...' : '작성하기' }}
          </button>
        </div>
      </div>

      <!-- 로딩 오버레이 -->
      <div v-if="isLoading" class="loading-overlay">
        <div class="loading-content">
          <img src="/logo.png" alt="로딩 중" class="loading-logo" />
          <p>쓰레드 이미지를 생성하는 중입니다...</p>
          <div class="loading-spinner"></div>
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
  placeholder: '내용을 입력하세요',
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
    } else if (error.response?.status === 403) {
      alert('권한이 없습니다.')
    } else if (error.response?.status >= 500) {
      alert('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    } else {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        '쓰레드 작성에 실패했습니다.'
      alert(errorMessage)
    }
  }
}
</script>

<style scoped>
.book-detail-container {
  padding: 20px;
  min-height: 80vh; /* 최소 높이 설정 */
}

.book-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.thread-write-btn {
  padding: 8px 16px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.book-content {
  margin-top: 20px;
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

/* 쓰레드 작성 폼 스타일 */
.thread-write-form {
  position: relative;
}

.book-info {
  margin-bottom: 20px;
  padding: 10px;
  border: 1px solid #ccc;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.form-actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.form-actions button:first-child {
  background-color: #f1f1f1;
}

.form-actions button:last-child {
  background-color: #4caf50;
  color: white;
}

.form-actions button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

/* 로딩 오버레이 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
}

.loading-content {
  text-align: center;
}

.loading-logo {
  width: 80px;
  height: auto;
  margin-bottom: 15px;
  animation: pulse 2s infinite;
}

.loading-spinner {
  border: 5px solid #f3f3f3;
  border-top: 5px solid #4caf50;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 2s linear infinite;
  margin: 15px auto 0;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

/* Quill 에디터 스타일 */
.editor-container {
  height: 300px;
  margin-bottom: 20px;
}

/* Quill 에디터 안의 내용 영역 스타일 */
:deep(.ql-editor) {
  min-height: 200px;
  font-size: 14px;
  line-height: 1.6;
}
</style>
