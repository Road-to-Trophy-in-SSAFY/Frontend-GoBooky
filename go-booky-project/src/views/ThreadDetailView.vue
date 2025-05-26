<!-- 쓰레드 상세 보기 -->
<template>
  <div v-if="thread" class="thread-detail">
    <h2>{{ thread.title }}</h2>

    <!-- 쓰레드 이미지 표시 -->
    <div class="thread-image">
      <img
        v-if="threadImage !== '/logo.png'"
        :src="threadImage"
        alt="쓰레드 이미지"
        class="cover-image"
        @error="handleImageError"
      />
      <div v-else class="image-placeholder">
        <div class="loading-spinner"></div>
        <p>이미지 생성 중...</p>
      </div>
    </div>

    <p>책: {{ thread.book.title }}</p>
    <p>작성일: {{ formatDate(thread.created_at) }}</p>
    <p>독서일: {{ formatDate(thread.reading_date) }}</p>
    <div class="content" v-html="thread.content"></div>

    <div class="actions">
      <button @click="handleLikeThread">
        <span v-if="isLiked">❤️</span>
        <span v-else>🤍</span>
        {{ likesCount }}
      </button>
      <button @click="showEditModal = true" class="edit-btn">수정</button>
      <button @click="showDeleteModal = true" class="delete-btn">삭제</button>
    </div>

    <!-- 수정 모달 -->
    <Modal
      :model-value="showEditModal"
      @update:model-value="showEditModal = $event"
      title="쓰레드 수정"
      :close-on-overlay-click="false"
    >
      <div class="edit-form">
        <div class="form-group">
          <label for="title">제목</label>
          <input id="title" v-model="editForm.title" type="text" required />
        </div>
        <div class="form-group">
          <label for="content">내용</label>
          <QuillEditor
            v-model:content="editForm.content"
            contentType="html"
            theme="snow"
            toolbar="essential"
            :options="editorOptions"
            class="editor-container"
          />
        </div>
        <div class="form-group">
          <label for="reading_date">독서일</label>
          <input id="reading_date" v-model="editForm.reading_date" type="date" required />
        </div>
      </div>
      <template #footer>
        <div class="modal-actions">
          <button @click="showEditModal = false" :disabled="isLoading">취소</button>
          <button @click="handleUpdateThread" :disabled="isLoading" class="save-btn">
            {{ isLoading ? '저장 중...' : '저장' }}
          </button>
        </div>
      </template>
    </Modal>

    <!-- 삭제 확인 모달 -->
    <ConfirmModal
      :model-value="showDeleteModal"
      @update:model-value="showDeleteModal = $event"
      title="쓰레드 삭제"
      message="정말 이 쓰레드를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
      confirm-text="삭제"
      @confirm="confirmDelete"
    />
  </div>
  <div v-else>
    <p>쓰레드를 불러오는 중입니다...</p>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Modal from '@/components/Modal.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import { useThreads } from '@/composables/useThreads'
import { useValidation, combinedSchemas } from '@/composables/useValidation'

const route = useRoute()
const router = useRouter()

// 지침에 따른 Composables 사용
const {
  selectedThread,
  fetchThread,
  updateThread: updateThreadAPI,
  deleteThread: deleteThreadAPI,
  toggleLike,
  isLoading,
} = useThreads()
const { validate, clearErrors } = useValidation(combinedSchemas.thread)

const thread = computed(() => selectedThread.value)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const isLiked = computed(() => thread.value?.liked || false)
const likesCount = computed(() => thread.value?.likes_count || 0)
const editForm = ref({
  title: '',
  content: '',
  reading_date: '',
  book: null,
})

// API URL
const API_URL = 'http://127.0.0.1:8000'

// 쓰레드 이미지 계산
const threadImage = computed(() => {
  if (thread.value) {
    // 1. cover_img_url이 있으면 우선 사용 (백엔드에서 제공하는 완전한 URL)
    if (thread.value.cover_img_url) {
      console.log('🖼️ [ThreadDetailView] cover_img_url 사용:', thread.value.cover_img_url)
      return thread.value.cover_img_url
    }

    // 2. cover_img 필드가 있으면 사용
    if (thread.value.cover_img) {
      // 절대 경로인지 확인
      if (thread.value.cover_img.startsWith('http')) {
        console.log('🖼️ [ThreadDetailView] 절대 경로 cover_img 사용:', thread.value.cover_img)
        return thread.value.cover_img
      }
      // 상대 경로면 API URL과 결합
      const imageUrl = `${API_URL}/media/${thread.value.cover_img}`
      console.log('🖼️ [ThreadDetailView] 상대 경로 cover_img 사용:', imageUrl)
      return imageUrl
    }
  }

  // 기본 이미지 사용
  console.log('🖼️ [ThreadDetailView] 기본 이미지 사용')
  return '/logo.png'
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

const loadThread = async () => {
  try {
    const threadId = route.params.id

    // ID가 유효한지 확인
    if (!threadId || threadId === 'undefined') {
      console.error('유효하지 않은 쓰레드 ID:', threadId)
      router.push({ name: 'threads' })
      return
    }

    // 지침에 따른 Composable 사용
    await fetchThread(threadId)

    if (thread.value) {
      editForm.value = {
        title: thread.value.title,
        content: thread.value.content,
        reading_date: thread.value.reading_date,
        book: thread.value.book?.id || null,
      }
    }
  } catch (error) {
    console.error('쓰레드 데이터 로드 실패:', error)
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

const handleUpdateThread = async () => {
  try {
    clearErrors()

    // 지침에 따른 검증
    const isValid = await validate(editForm.value)
    if (!isValid) {
      console.log('❌ [ThreadDetailView] 폼 검증 실패')
      return
    }

    const threadId = route.params.id
    await updateThreadAPI(threadId, editForm.value)

    showEditModal.value = false
    console.log('✅ [ThreadDetailView] 쓰레드 수정 성공')
  } catch (error) {
    console.error('❌ [ThreadDetailView] 쓰레드 수정 실패:', error)
  }
}

const confirmDelete = async () => {
  try {
    const threadId = route.params.id
    await deleteThreadAPI(threadId)
    router.push({ name: 'threads' })
    console.log('✅ [ThreadDetailView] 쓰레드 삭제 성공')
  } catch (error) {
    console.error('❌ [ThreadDetailView] 쓰레드 삭제 실패:', error)
  }
}

const handleLikeThread = async () => {
  try {
    const threadId = route.params.id
    await toggleLike(threadId)
    console.log('✅ [ThreadDetailView] 좋아요 토글 성공')
  } catch (error) {
    console.error('❌ [ThreadDetailView] 좋아요 처리 실패:', error)
  }
}

const handleImageError = () => {
  console.log('🖼️ [ThreadDetailView] 이미지 로드 실패 - 기본 이미지 사용')
}

// 이미지가 없는 경우 주기적으로 쓰레드 정보 새로고침
let imageCheckInterval = null

onMounted(async () => {
  // 컴포넌트 마운트 시 ID 유효성 검사
  const threadId = route.params.id
  if (!threadId || threadId === 'undefined') {
    console.error('유효하지 않은 쓰레드 ID:', threadId)
    router.push({ name: 'threads' }) // 유효하지 않은 ID인 경우 목록 페이지로 리다이렉트
    return
  }

  await loadThread()

  // 이미지가 없으면 주기적으로 확인
  if (!thread.value?.cover_img_url && !thread.value?.cover_img) {
    console.log('🔄 [ThreadDetailView] 이미지 생성 대기 중 - 주기적 확인 시작')
    imageCheckInterval = setInterval(async () => {
      try {
        await fetchThread(threadId)
        if (thread.value?.cover_img_url || thread.value?.cover_img) {
          console.log('✅ [ThreadDetailView] 이미지 생성 완료 - 주기적 확인 중단')
          clearInterval(imageCheckInterval)
        }
      } catch (error) {
        console.error('❌ [ThreadDetailView] 이미지 확인 실패:', error)
      }
    }, 3000) // 3초마다 확인
  }
})

// 컴포넌트 언마운트 시 인터벌 정리
import { onUnmounted } from 'vue'
onUnmounted(() => {
  if (imageCheckInterval) {
    clearInterval(imageCheckInterval)
  }
})
</script>

<style scoped>
.thread-detail {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.thread-image {
  margin: 20px 0;
  text-align: center;
}

.cover-image {
  max-width: 100%;
  max-height: 400px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 2px dashed #dee2e6;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4caf50;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 2s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.content {
  margin: 20px 0;
  white-space: pre-line;
  line-height: 1.6;
}

.actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

.actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.like-btn {
  background-color: #3498db;
  color: white;
}

.edit-btn {
  background-color: #f39c12;
  color: white;
}

.delete-btn {
  background-color: #e74c3c;
  color: white;
}

/* 수정 폼 스타일 */
.edit-form {
  padding: 10px;
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

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.modal-actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.modal-actions button:first-child {
  background-color: #f1f1f1;
}

.save-btn {
  background-color: #4caf50;
  color: white;
}

.modal-actions button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
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
