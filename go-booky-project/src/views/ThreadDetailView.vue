<!-- 쓰레드 상세 보기 -->
<template>
  <div v-if="thread && thread.id === currentThreadId && !isTransitioning" class="thread-detail">
    <!-- 헤더 섹션 -->
    <div class="thread-header">
      <div class="header-content">
        <div class="breadcrumb">
          <router-link to="/threads" class="breadcrumb-link">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 12H5M12 19L5 12L12 5"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            독서 기록 목록
          </router-link>
          <span class="breadcrumb-separator">></span>
          <span class="breadcrumb-current">{{ thread.title }}</span>
        </div>

        <h1 class="thread-title">{{ thread.title }}</h1>

        <!-- 메타 정보 -->
        <div class="thread-meta">
          <div class="meta-item">
            <div class="meta-icon">📚</div>
            <div class="meta-content">
              <span class="meta-label">도서</span>
              <router-link
                :to="{ name: 'book-detail', params: { id: thread.book.id } }"
                class="book-link"
              >
                {{ thread.book.title }}
              </router-link>
            </div>
          </div>

          <div class="meta-item">
            <div class="meta-icon">👤</div>
            <div class="meta-content">
              <span class="meta-label">작성자</span>
              <span class="meta-value">{{ thread.user?.username || '익명' }}</span>
            </div>
          </div>

          <div class="meta-item">
            <div class="meta-icon">📅</div>
            <div class="meta-content">
              <span class="meta-label">독서 완료일</span>
              <span class="meta-value">{{ formatDate(thread.reading_date) }}</span>
            </div>
          </div>

          <div class="meta-item">
            <div class="meta-icon">🕒</div>
            <div class="meta-content">
              <span class="meta-label">작성일</span>
              <span class="meta-value">{{ formatDate(thread.created_at) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 이미지 섹션 -->
    <div class="thread-image-section">
      <!-- AI 이미지 생성 중 -->
      <div v-if="imageState.isGenerating" class="image-placeholder generating">
        <div class="loading-spinner ai-generating"></div>
        <div class="generation-info">
          <p class="generation-title">🎨 AI 이미지 생성 중...</p>
          <p class="generation-subtitle">독서 기록을 바탕으로 맞춤 이미지를 만들고 있어요</p>
          <div class="progress-indicator">
            <div class="progress-dots">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </div>
            <p class="progress-text">확인 중</p>
          </div>
        </div>
      </div>

      <!-- 일반 이미지 로딩 중 -->
      <div v-else-if="imageState.loading && !imageState.showActualImage" class="image-placeholder">
        <div class="loading-spinner"></div>
        <p>이미지 로딩 중...</p>
      </div>

      <!-- 실제 이미지 -->
      <Transition v-else-if="imageState.showActualImage" name="image-fade" appear>
        <img
          :src="imageState.actualImageUrl"
          alt="쓰레드 이미지"
          class="cover-image"
          @load="handleImageLoad"
          @error="handleImageError"
        />
      </Transition>

      <!-- 대체 이미지 -->
      <div v-else class="default-image-container">
        <img src="/logo.png" alt="기본 이미지" class="cover-image default" />
        <div class="image-overlay">
          <p>이미지가 생성되지 않았습니다</p>
        </div>
      </div>
    </div>

    <!-- 콘텐츠 섹션 -->
    <div class="thread-content-section">
      <div class="content-header">
        <h2 class="content-title">
          <span class="content-icon">📖</span>
          독서 후기
        </h2>
      </div>
      <div class="content" v-html="thread.content"></div>
    </div>

    <!-- 액션 섹션 -->
    <div class="thread-actions">
      <div class="action-group primary">
        <button
          @click="handleLikeThread"
          class="action-btn like-button"
          :class="{ liked: isLiked, animate: isAnimating(route.params.id) }"
          :aria-label="isLiked ? '좋아요 취소' : '좋아요'"
          :aria-pressed="isLiked"
          type="button"
        >
          <Transition name="heart" mode="out-in">
            <span v-if="isLiked" key="filled" class="heart-icon filled" aria-hidden="true">❤️</span>
            <span v-else key="empty" class="heart-icon empty" aria-hidden="true">🤍</span>
          </Transition>
          <Transition name="count" mode="out-in">
            <span :key="likesCount" class="like-count">{{ likesCount }}</span>
          </Transition>
          <span class="action-text">{{ isLiked ? '좋아요 취소' : '좋아요' }}</span>
        </button>

        <button class="action-btn share-button" @click="shareThread">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 12V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V12"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M16 6L12 2L8 6"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M12 2V15"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span class="action-text">공유하기</span>
        </button>
      </div>

      <div v-if="isThreadOwner" class="action-group secondary">
        <button @click="showEditModal = true" class="action-btn edit-btn">
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
          <span class="action-text">수정</span>
        </button>

        <button @click="showDeleteModal = true" class="action-btn delete-btn">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 6H5H21"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span class="action-text">삭제</span>
        </button>
      </div>
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
            :enable="true"
            :read-only="false"
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

    <!-- 댓글 섹션 -->
    <CommentSection :thread-id="parseInt(route.params.id)" />
  </div>
  <div v-else class="loading-container">
    <div class="loading-spinner"></div>
    <p>
      {{
        isTransitioning
          ? '새로운 쓰레드를 불러오는 중...'
          : isLoading
            ? '쓰레드를 불러오는 중입니다...'
            : '쓰레드 정보를 준비하고 있습니다...'
      }}
    </p>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Modal from '@/components/Modal.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import CommentSection from '@/components/comment/CommentSection.vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import { useThreads } from '@/composables/useThreads'
import { useValidation, combinedSchemas } from '@/composables/useValidation'
import { useToast } from '@/composables/useToast'
import { useAnimation } from '@/composables/useAnimation'
import { useAuthStore } from '@/stores/auth'
import { useThreadStore } from '@/stores/thread'

const route = useRoute()
const router = useRouter()

// 지침에 따른 Composables 사용
const {
  selectedThread,
  fetchThread,
  clearThreadDetail,
  updateThread: updateThreadAPI,
  deleteThread: deleteThreadAPI,
  toggleLike,
  isLoading,
} = useThreads()
const { validate, clearErrors } = useValidation(combinedSchemas.threadUpdate)
const { error: showErrorToast } = useToast()
const { startAnimation, isAnimating } = useAnimation()
const authStore = useAuthStore()
const threadStore = useThreadStore()

const thread = computed(() => selectedThread.value)
const showEditModal = ref(false)
const showDeleteModal = ref(false)

// 🔧 좋아요 상태를 스토어에서 직접 가져와서 동기화 보장
const isLiked = computed(() => {
  if (!thread.value?.id) return false
  const storeThread = threadStore.getThreadById(thread.value.id)
  return storeThread?.liked || thread.value?.liked || false
})

const likesCount = computed(() => {
  if (!thread.value?.id) return 0
  const storeThread = threadStore.getThreadById(thread.value.id)
  return storeThread?.likes_count || thread.value?.likes_count || 0
})

// 페이지 전환 상태 관리
const isTransitioning = ref(false)
const currentThreadId = ref(null)

// 현재 사용자가 쓰레드 작성자인지 확인
const isThreadOwner = computed(() => {
  if (!thread.value || !authStore.user) {
    return false
  }
  // ThreadDetailSerializer에서 user 객체를 반환하므로 user.id로 접근
  return thread.value.user?.id === authStore.user.id
})
const editForm = ref({
  title: '',
  content: '',
  reading_date: '',
  book: null,
})

// 이미지 상태 관리
const imageState = ref({
  loading: false,
  showActualImage: false,
  actualImageUrl: null,
  hasError: false,
  loadAttempted: false,
  isGenerating: false, // AI 이미지 생성 중 상태
})

// 이미지 생성 폴링 관련
const imagePollingInterval = ref(null)
const maxPollingAttempts = 30 // 최대 30번 시도 (약 1분)
const pollingAttempts = ref(0)

// API URL
const API_URL = 'http://127.0.0.1:8000'

// 이미지 상태 초기화 및 로딩 로직
const initializeImageState = () => {
  if (!thread.value) return

  // 기존 폴링 정리
  clearImagePolling()

  // 상태 초기화
  imageState.value = {
    loading: false,
    showActualImage: false,
    actualImageUrl: null,
    hasError: false,
    loadAttempted: false,
    isGenerating: false,
  }

  // 이미지 URL 확인
  let imageUrl = null

  if (thread.value.cover_img_url) {
    imageUrl = thread.value.cover_img_url
  } else if (thread.value.cover_img) {
    if (thread.value.cover_img.startsWith('http')) {
      imageUrl = thread.value.cover_img
    } else {
      imageUrl = `${API_URL}/media/${thread.value.cover_img}`
    }
  }

  if (imageUrl) {
    // 이미지가 있는 경우 로딩 시작
    imageState.value.loading = true
    imageState.value.actualImageUrl = imageUrl
    imageState.value.loadAttempted = true

    // 이미지 프리로드
    const img = new Image()
    img.onload = () => {
      imageState.value.loading = false
      imageState.value.showActualImage = true
    }
    img.onerror = () => {
      imageState.value.loading = false
      imageState.value.hasError = true
      console.warn('🖼️ [ThreadDetailView] 이미지 로드 실패:', imageUrl)
    }
    img.src = imageUrl
  } else {
    // 이미지가 없는 경우 - 새로 생성된 쓰레드인지 확인
    const threadCreatedTime = new Date(thread.value.created_at).getTime()
    const currentTime = new Date().getTime()
    const timeDiff = currentTime - threadCreatedTime

    // 5분 이내에 생성된 쓰레드라면 이미지 생성 중으로 간주
    if (timeDiff < 5 * 60 * 1000) {
      console.log('🎨 [ThreadDetailView] 최근 생성된 쓰레드 - 이미지 생성 폴링 시작')
      startImageGenerationPolling()
    } else {
      // 오래된 쓰레드는 바로 대체 이미지 표시
      imageState.value.loading = false
      imageState.value.loadAttempted = true
    }
  }
}

// 이미지 생성 폴링 시작
const startImageGenerationPolling = () => {
  imageState.value.isGenerating = true
  imageState.value.loading = true
  pollingAttempts.value = 0

  console.log('🔄 [ThreadDetailView] 이미지 생성 폴링 시작')

  imagePollingInterval.value = setInterval(async () => {
    pollingAttempts.value++

    try {
      // 쓰레드 정보 다시 조회
      await fetchThread(parseInt(route.params.id))

      // 이미지가 생성되었는지 확인
      if (thread.value && (thread.value.cover_img || thread.value.cover_img_url)) {
        console.log('✅ [ThreadDetailView] 이미지 생성 완료 감지')
        clearImagePolling()

        // 부드러운 전환을 위해 약간의 지연 후 이미지 로딩 시작
        setTimeout(() => {
          initializeImageState()
          // 이미지 생성 완료 알림 (선택적)
          console.log('🎨 [ThreadDetailView] AI 이미지 생성이 완료되었습니다!')
        }, 300)
        return
      }

      // 최대 시도 횟수 도달 시 폴링 중단
      if (pollingAttempts.value >= maxPollingAttempts) {
        console.log('⏰ [ThreadDetailView] 이미지 생성 폴링 타임아웃')
        clearImagePolling()
        imageState.value.isGenerating = false
        imageState.value.loading = false
        imageState.value.loadAttempted = true
      }
    } catch (error) {
      console.error('❌ [ThreadDetailView] 이미지 폴링 중 오류:', error)
    }
  }, 2000) // 2초마다 확인
}

// 이미지 폴링 정리
const clearImagePolling = () => {
  if (imagePollingInterval.value) {
    clearInterval(imagePollingInterval.value)
    imagePollingInterval.value = null
  }
  imageState.value.isGenerating = false
  pollingAttempts.value = 0
}

// 이미지 로드 성공 핸들러
const handleImageLoad = () => {
  console.log('✅ [ThreadDetailView] 이미지 로드 성공')
  // 이미지 로딩 상태를 false로 설정하여 부드러운 전환 효과 적용
  imageState.value.loading = false
}

// 이미지 로드 실패 핸들러
const handleImageError = () => {
  console.warn('❌ [ThreadDetailView] 이미지 로드 실패')
  imageState.value.showActualImage = false
  imageState.value.hasError = true
}

// 라우트 변경 감지 및 전환 상태 관리
watch(
  () => route.params.id,
  async (newId, oldId) => {
    const newThreadId = parseInt(newId)

    // ID가 유효하지 않으면 처리하지 않음
    if (!newThreadId || isNaN(newThreadId)) {
      console.error('❌ [ThreadDetailView] 유효하지 않은 쓰레드 ID:', newId)
      return
    }

    // 동일한 ID면 처리하지 않음
    if (newThreadId === currentThreadId.value) {
      return
    }

    console.log('🔄 [ThreadDetailView] 쓰레드 전환:', oldId, '→', newId)

    // 전환 시작 - 이전 데이터 즉시 클리어
    isTransitioning.value = true
    clearThreadDetail()
    currentThreadId.value = newThreadId

    try {
      await loadThread()
    } finally {
      // 전환 완료
      isTransitioning.value = false
    }
  },
  { immediate: false },
)

// 쓰레드 변경 시 이미지 상태 초기화
watch(
  thread,
  (newThread) => {
    if (newThread && newThread.id === currentThreadId.value) {
      initializeImageState()
    }
  },
  { immediate: true },
)

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
  // DOMNodeInserted 이벤트 사용 방지
  bounds: document.body,
  scrollingContainer: null,
}

const loadThread = async () => {
  try {
    const threadId = parseInt(route.params.id)

    // ID가 유효한지 확인
    if (!threadId || isNaN(threadId)) {
      console.error('유효하지 않은 쓰레드 ID:', route.params.id)
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
    // 권한 체크
    if (!isThreadOwner.value) {
      console.error('❌ [ThreadDetailView] 수정 권한 없음')
      showErrorToast('수정 권한이 없습니다.')
      return
    }

    clearErrors()

    // 수정용 검증 (book 필드 제외)
    const updateData = {
      title: editForm.value.title,
      content: editForm.value.content,
      reading_date: editForm.value.reading_date,
    }

    const isValid = await validate(updateData)
    if (!isValid) {
      console.log('❌ [ThreadDetailView] 폼 검증 실패')
      return
    }

    const threadId = parseInt(route.params.id)
    if (!threadId || isNaN(threadId)) {
      console.error('❌ [ThreadDetailView] 유효하지 않은 쓰레드 ID:', route.params.id)
      return
    }

    await updateThreadAPI(threadId, editForm.value)

    // 수정 완료 후 최신 데이터 다시 불러오기
    await fetchThread(threadId)

    // editForm도 최신 데이터로 업데이트
    if (thread.value) {
      editForm.value = {
        title: thread.value.title,
        content: thread.value.content,
        reading_date: thread.value.reading_date,
        book: thread.value.book?.id || null,
      }
    }

    showEditModal.value = false
    console.log('✅ [ThreadDetailView] 쓰레드 수정 성공')
  } catch (error) {
    console.error('❌ [ThreadDetailView] 쓰레드 수정 실패:', error)
    alert('쓰레드 수정에 실패했습니다.')
  }
}

const confirmDelete = async () => {
  try {
    // 권한 체크
    if (!isThreadOwner.value) {
      console.error('❌ [ThreadDetailView] 삭제 권한 없음')
      showErrorToast('삭제 권한이 없습니다.')
      return
    }

    const threadId = parseInt(route.params.id)
    if (!threadId || isNaN(threadId)) {
      console.error('❌ [ThreadDetailView] 유효하지 않은 쓰레드 ID:', route.params.id)
      return
    }

    await deleteThreadAPI(threadId)
    router.push({ name: 'threads' })
    console.log('✅ [ThreadDetailView] 쓰레드 삭제 성공')
  } catch (error) {
    console.error('❌ [ThreadDetailView] 쓰레드 삭제 실패:', error)
  }
}

const handleLikeThread = async () => {
  try {
    // 🔧 타입 불일치 수정: 문자열 → 숫자 변환
    const threadId = parseInt(route.params.id)

    if (!threadId || isNaN(threadId)) {
      console.error('❌ [ThreadDetailView] 유효하지 않은 쓰레드 ID:', route.params.id)
      showErrorToast('유효하지 않은 쓰레드입니다.')
      return
    }

    // 현재 상태 로깅
    console.log('🎯 [ThreadDetailView] 좋아요 토글 시작:', {
      threadId,
      currentLiked: isLiked.value,
      currentCount: likesCount.value,
    })

    // 애니메이션 시작 (지침 준수: "비즈니스 로직은 훅으로")
    startAnimation(threadId)

    await toggleLike(threadId)
    console.log('✅ [ThreadDetailView] 좋아요 토글 성공:', {
      threadId,
      newLiked: isLiked.value,
      newCount: likesCount.value,
    })
  } catch (error) {
    console.error('❌ [ThreadDetailView] 좋아요 처리 실패:', error)

    // 사용자에게 에러 알림 (지침 준수: "일관된 UX")
    showErrorToast(error.message || '좋아요 처리에 실패했습니다.')
  }
}

// 공유 기능
const shareThread = async () => {
  try {
    const shareData = {
      title: `${thread.value.title} - GoBooky`,
      text: `"${thread.value.book.title}"에 대한 독서 기록을 확인해보세요!`,
      url: window.location.href,
    }

    if (navigator.share) {
      await navigator.share(shareData)
      console.log('✅ [ThreadDetailView] 공유 성공')
    } else {
      // Web Share API를 지원하지 않는 경우 클립보드에 복사
      await navigator.clipboard.writeText(window.location.href)
      showErrorToast('링크가 클립보드에 복사되었습니다!')
      console.log('✅ [ThreadDetailView] 링크 복사 성공')
    }
  } catch (error) {
    console.error('❌ [ThreadDetailView] 공유 실패:', error)
    showErrorToast('공유에 실패했습니다.')
  }
}

onMounted(async () => {
  // 컴포넌트 마운트 시 ID 유효성 검사
  const threadId = parseInt(route.params.id)
  if (!threadId || isNaN(threadId)) {
    console.error('❌ [ThreadDetailView] 유효하지 않은 쓰레드 ID:', route.params.id)
    router.push({ name: 'threads' }) // 유효하지 않은 ID인 경우 목록 페이지로 리다이렉트
    return
  }

  console.log('🚀 [ThreadDetailView] 컴포넌트 마운트, 쓰레드 ID:', threadId)

  // 초기 상태 설정
  isTransitioning.value = true
  currentThreadId.value = threadId
  clearThreadDetail()

  try {
    await loadThread()
  } finally {
    isTransitioning.value = false
  }
})

// 컴포넌트 언마운트 시 정리
onUnmounted(() => {
  console.log('🧹 [ThreadDetailView] 컴포넌트 언마운트 - 리소스 정리')
  clearImagePolling()
  clearThreadDetail()
})
</script>

<style scoped>
.thread-detail {
  max-width: 900px;
  margin: 0 auto;
  padding: 0;
  animation: fadeInUp 0.3s ease-out;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #f1f3f4;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 헤더 섹션 */
.thread-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px;
  position: relative;
  overflow: hidden;
}

.thread-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.05)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.3;
}

.header-content {
  position: relative;
  z-index: 1;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  font-size: 14px;
}

.breadcrumb-link {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  transition: all 0.3s ease;
  padding: 6px 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
}

.breadcrumb-link:hover {
  color: white;
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.breadcrumb-separator {
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
}

.breadcrumb-current {
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.thread-title {
  font-size: 32px;
  font-weight: 800;
  margin: 0 0 24px 0;
  line-height: 1.2;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.thread-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.meta-item:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.meta-icon {
  font-size: 20px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  flex-shrink: 0;
}

.meta-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.meta-label {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.meta-value {
  font-size: 14px;
  font-weight: 600;
  color: white;
}

.book-link {
  font-size: 14px;
  font-weight: 600;
  color: white;
  text-decoration: none;
  transition: all 0.3s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
}

.book-link:hover {
  color: #ffd700;
  border-bottom-color: #ffd700;
}

/* 이미지 섹션 */
.thread-image-section {
  padding: 40px;
  text-align: center;
  background: #fafbfc;
  border-bottom: 1px solid #e2e8f0;
}

/* 콘텐츠 섹션 */
.thread-content-section {
  padding: 40px;
}

.content-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f1f3f4;
}

.content-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.content-icon {
  font-size: 28px;
}

.cover-image {
  max-width: 100%;
  max-height: 400px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.cover-image:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
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

/* AI 이미지 생성 중 스타일 */
.image-placeholder.generating {
  min-height: 300px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: 2px solid #667eea;
  color: white;
  position: relative;
  overflow: hidden;
}

.image-placeholder.generating::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%) translateY(-100%) rotate(45deg);
  }
  100% {
    transform: translateX(100%) translateY(100%) rotate(45deg);
  }
}

.generation-info {
  text-align: center;
  z-index: 1;
  position: relative;
}

.generation-title {
  font-size: 1.2em;
  font-weight: 600;
  margin: 0 0 8px 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.generation-subtitle {
  font-size: 0.9em;
  opacity: 0.9;
  margin: 0 0 20px 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.progress-indicator {
  margin-top: 16px;
}

.progress-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 8px;
}

.progress-dots .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.7);
  animation: dotPulse 1.5s infinite ease-in-out;
}

.progress-dots .dot:nth-child(1) {
  animation-delay: 0s;
}

.progress-dots .dot:nth-child(2) {
  animation-delay: 0.3s;
}

.progress-dots .dot:nth-child(3) {
  animation-delay: 0.6s;
}

@keyframes dotPulse {
  0%,
  60%,
  100% {
    transform: scale(1);
    opacity: 0.7;
  }
  30% {
    transform: scale(1.3);
    opacity: 1;
  }
}

.progress-text {
  font-size: 0.8em;
  opacity: 0.8;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.ai-generating {
  border-color: rgba(255, 255, 255, 0.3);
  border-top-color: white;
  animation: spin 1.5s linear infinite;
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

/* 이미지 페이드인 애니메이션 */
.image-fade-enter-active {
  transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.image-fade-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(20px);
  filter: blur(4px);
}

.image-fade-enter-to {
  opacity: 1;
  transform: scale(1) translateY(0);
  filter: blur(0px);
}

/* 대체 이미지 컨테이너 스타일 */
.default-image-container {
  position: relative;
  height: 300px;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f8f9fa;
}

.default-image-container .cover-image.default {
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: 0.3;
  filter: grayscale(100%);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.1);
  color: #6c757d;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  pointer-events: none;
}

.image-overlay p {
  margin: 0;
  padding: 8px 16px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.content {
  font-size: 16px;
  line-height: 1.8;
  color: #374151;
  white-space: pre-line;
}

/* 액션 섹션 */
.thread-actions {
  padding: 32px 40px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.action-group {
  display: flex;
  gap: 12px;
  align-items: center;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: 2px solid transparent;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  color: #64748b;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.action-text {
  font-weight: 600;
}

/* 좋아요 버튼 스타일 */
.like-button {
  border-color: #e2e8f0;
  color: #64748b;
  position: relative;
  overflow: hidden;
}

.like-button:hover {
  border-color: #cbd5e1;
  color: #475569;
}

.like-button.liked {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border-color: #fca5a5;
  color: #dc2626;
}

.like-button.liked:hover {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  border-color: #f87171;
}

/* 공유 버튼 */
.share-button {
  border-color: #e2e8f0;
  color: #64748b;
}

.share-button:hover {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-color: #7dd3fc;
  color: #0369a1;
}

/* 수정 버튼 */
.edit-btn {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-color: #f59e0b;
  color: #92400e;
}

.edit-btn:hover {
  background: linear-gradient(135deg, #fde68a 0%, #fcd34d 100%);
  border-color: #d97706;
  color: #78350f;
}

/* 삭제 버튼 */
.delete-btn {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border-color: #fca5a5;
  color: #dc2626;
}

.delete-btn:hover {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  border-color: #f87171;
  color: #b91c1c;
}

/* 클릭 애니메이션 */
.like-button.animate {
  animation: heartBeat 0.6s ease-in-out;
}

@keyframes heartBeat {
  0% {
    transform: scale(1);
  }
  14% {
    transform: scale(1.3);
  }
  28% {
    transform: scale(1);
  }
  42% {
    transform: scale(1.2);
  }
  70% {
    transform: scale(1);
  }
}

/* 하트 아이콘 애니메이션 */
.heart-icon {
  font-size: 20px;
  display: inline-block;
}

.heart-enter-active,
.heart-leave-active {
  transition: all 0.3s ease;
}

.heart-enter-from {
  opacity: 0;
  transform: scale(0) rotate(180deg);
}

.heart-leave-to {
  opacity: 0;
  transform: scale(0) rotate(-180deg);
}

.heart-enter-to,
.heart-leave-from {
  opacity: 1;
  transform: scale(1) rotate(0deg);
}

/* 좋아요 수 애니메이션 */
.like-count {
  font-weight: 600;
  font-size: 14px;
}

.count-enter-active,
.count-leave-active {
  transition: all 0.2s ease;
}

.count-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(1.2);
}

.count-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.8);
}

.count-enter-to,
.count-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .thread-header {
    padding: 24px;
  }

  .thread-title {
    font-size: 24px;
  }

  .thread-meta {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .meta-item {
    padding: 12px;
  }

  .thread-image-section,
  .thread-content-section {
    padding: 24px;
  }

  .thread-actions {
    padding: 24px;
    flex-direction: column;
    align-items: stretch;
  }

  .action-group {
    justify-content: center;
  }

  .action-btn {
    flex: 1;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .thread-header {
    padding: 20px;
  }

  .thread-title {
    font-size: 20px;
  }

  .breadcrumb-current {
    max-width: 150px;
  }

  .thread-image-section,
  .thread-content-section {
    padding: 20px;
  }

  .thread-actions {
    padding: 20px;
  }

  .action-group {
    flex-direction: column;
    width: 100%;
  }

  .action-btn {
    width: 100%;
  }
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

/* 로딩 컨테이너 스타일 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 40px;
  text-align: center;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.loading-container .loading-spinner {
  margin-bottom: 20px;
}

.loading-container p {
  color: #6c757d;
  font-size: 16px;
  margin: 0;
}
</style>
