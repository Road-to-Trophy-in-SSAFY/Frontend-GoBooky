<template>
  <div class="profile-page">
    <!-- 헤더 -->
    <div class="profile-header-bar">
      <button class="home-btn" @click="goHome">🏠 홈으로</button>
      <h1 class="page-title">프로필</h1>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>프로필 정보를 불러오는 중...</p>
    </div>

    <!-- 프로필 정보 -->
    <div v-else-if="profile" class="profile-content">
      <!-- 프로필 기본 정보 -->
      <div class="profile-basic-info">
        <div class="profile-avatar-section">
          <div class="avatar-container">
            <img
              v-if="!imageError"
              :src="getProfileImageUrl(profile.profile_picture_url)"
              alt="프로필 사진"
              class="profile-avatar"
              @error="handleImageError"
              @load="handleImageLoad"
            />
            <img
              v-else
              src="/default-avatar.png"
              alt="기본 프로필 사진"
              class="profile-avatar"
              @error="handleDefaultImageError"
            />
          </div>
        </div>

        <div class="profile-info-section">
          <h2 class="username">{{ profile.username }}</h2>
          <div class="follow-stats">
            <span class="stat-item">팔로워 {{ profile.followers_count || 0 }}</span>
            <span class="stat-divider">·</span>
            <span class="stat-item">팔로잉 {{ profile.following_count || 0 }}</span>
          </div>

          <!-- 팔로우 버튼 (다른 사용자 프로필일 때만) -->
          <button
            v-if="!isOwnProfile && auth.isAuthenticated"
            @click="toggleFollow"
            :disabled="followLoading"
            class="follow-button"
            :class="{ following: profile.is_following }"
          >
            {{ profile.is_following ? '팔로우 해제' : '팔로우' }}
          </button>
        </div>
      </div>

      <!-- 프로필 상세 정보 (본인만 볼 수 있음) -->
      <div v-if="isOwnProfile" class="profile-details-section">
        <div class="section-header">
          <h3>개인 정보</h3>
          <button @click="toggleEditMode" class="edit-toggle-btn">
            {{ isEditing ? '❌ 취소' : '✏️ 수정' }}
          </button>
        </div>

        <!-- 보기 모드 -->
        <div v-if="!isEditing" class="profile-details-view">
          <div class="detail-row">
            <span class="detail-label">이메일</span>
            <span class="detail-value">{{ profile.email }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">이름</span>
            <span class="detail-value">{{ profile.last_name }}{{ profile.first_name }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">성별</span>
            <span class="detail-value">{{ genderToKorean(profile.gender) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">주간 평균 독서 시간</span>
            <span class="detail-value">{{ profile.weekly_read_time || 0 }} 시간</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">연간 독서량</span>
            <span class="detail-value">{{ profile.yearly_read_count || 0 }} 권</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">관심 장르</span>
            <span class="detail-value">
              {{
                profile.categories?.length > 0
                  ? profile.categories.map((cat) => cat.name).join(', ')
                  : '미입력'
              }}
            </span>
          </div>
        </div>

        <!-- 수정 모드 -->
        <div v-else class="profile-details-edit">
          <form @submit.prevent="saveProfile" class="edit-form">
            <div class="form-group">
              <label for="profile_picture">프로필 사진</label>
              <input
                type="file"
                id="profile_picture"
                @change="handleProfilePictureChange"
                accept="image/*"
              />
              <span v-if="profilePictureError" class="error-text">{{ profilePictureError }}</span>
            </div>

            <div class="form-group">
              <label for="weekly_read_time">주간 평균 독서 시간 (시간)</label>
              <input
                type="number"
                id="weekly_read_time"
                v-model.number="editForm.weekly_read_time"
                min="0"
                placeholder="0"
              />
            </div>

            <div class="form-group">
              <label for="yearly_read_count">연간 독서량 (권)</label>
              <input
                type="number"
                id="yearly_read_count"
                v-model.number="editForm.yearly_read_count"
                min="0"
                placeholder="0"
              />
            </div>

            <div class="form-group">
              <label>관심 장르</label>
              <div class="categories-grid">
                <div
                  v-for="category in allCategories"
                  :key="category.id"
                  :class="[
                    'category-chip',
                    { selected: editForm.category_ids.includes(category.id) },
                  ]"
                  @click="toggleCategory(category.id)"
                >
                  {{ category.name }}
                </div>
              </div>
              <span v-if="categoriesError" class="error-text">{{ categoriesError }}</span>
            </div>

            <div class="form-actions">
              <button type="submit" :disabled="saveLoading" class="save-btn">
                {{ saveLoading ? '저장 중...' : '저장' }}
              </button>
              <button type="button" @click="cancelEdit" class="cancel-btn">취소</button>
            </div>
          </form>
        </div>
      </div>

      <!-- 활동 탭 (본인만 볼 수 있음) -->
      <div v-if="isOwnProfile" class="activity-section">
        <div class="tabs-container">
          <div class="tabs-header">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              :class="['tab-btn', { active: activeTab === tab.key }]"
              @click="setActiveTab(tab.key)"
            >
              {{ tab.key === 'books' ? '📚' : tab.key === 'comments' ? '💬' : '📝' }}
              {{ tab.label }}
              <span v-if="tab.count !== undefined" class="tab-count">({{ tab.count }})</span>
            </button>
          </div>

          <div class="tab-content">
            <!-- 나의 책 탭 -->
            <UserBooksList
              v-if="activeTab === 'books'"
              :books="userBooks"
              :pagination="booksPagination"
              :is-loading="profileComposable.isLoading.value"
              :error="profileComposable.error.value"
              :is-own-profile="true"
              @remove-book="handleRemoveBook"
              @page-change="handleBooksPageChange"
            />

            <!-- 댓글/대댓글 탭 -->
            <UserCommentsList
              v-if="activeTab === 'comments'"
              :comments="userComments"
              :pagination="commentsPagination"
              :is-loading="profileComposable.isLoading.value"
              :error="profileComposable.error.value"
              :is-own-profile="true"
              @delete-comment="handleDeleteComment"
              @delete-reply="handleDeleteReply"
              @page-change="handleCommentsPageChange"
            />

            <!-- 내 쓰레드 탭 -->
            <UserThreadsList
              v-if="activeTab === 'threads'"
              :threads="userThreads"
              :pagination="threadsPagination"
              :is-loading="profileComposable.isLoading.value"
              :error="profileComposable.error.value"
              :is-own-profile="true"
              @delete-thread="handleDeleteThread"
              @page-change="handleThreadsPageChange"
            />
          </div>
        </div>
      </div>

      <!-- 다른 사용자 프로필 메시지 -->
      <div v-else class="other-user-message">
        <div class="message-content">
          🔒
          <h3>개인 활동 내역</h3>
          <p>이 사용자의 개인 활동 내역은 비공개입니다.</p>
        </div>
      </div>
    </div>

    <!-- 에러 상태 -->
    <div v-else class="error-container">
      <div class="error-content">
        ❌
        <h3>프로필을 불러올 수 없습니다</h3>
        <p>{{ error || '프로필 정보를 불러오는데 실패했습니다.' }}</p>
        <button @click="fetchProfile" class="retry-btn">다시 시도</button>
      </div>
    </div>

    <!-- 토스트 메시지 -->
    <div v-if="toastMessage" class="toast" :class="toastType">
      {{ toastMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useProfile } from '@/composables/useProfile'
import api from '@/api'

// 컴포넌트 임포트
import UserBooksList from '@/components/profile/UserBooksList.vue'
import UserCommentsList from '@/components/profile/UserCommentsList.vue'
import UserThreadsList from '@/components/profile/UserThreadsList.vue'

// 라우터 및 스토어
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

// 상태 관리
const loading = ref(true)
const error = ref(null)
const profile = ref(null)
const isEditing = ref(false)
const followLoading = ref(false)
const saveLoading = ref(false)
const activeTab = ref('books')
const imageError = ref(false)

// 프로필 수정 관련
const allCategories = ref([])
const editForm = ref({
  weekly_read_time: 0,
  yearly_read_count: 0,
  category_ids: [],
})
const profilePictureFile = ref(null)
const profilePictureError = ref('')
const categoriesError = ref('')

// 토스트 메시지
const toastMessage = ref('')
const toastType = ref('success')

// 프로필 composable
const username = computed(() => route.params.username)
const profileComposable = useProfile(username)

const {
  userBooks,
  userComments,
  userThreads,
  booksPagination,
  commentsPagination,
  threadsPagination,
  fetchUserBooks,
  toggleBookSave,
  fetchUserComments,
  deleteComment,
  deleteReply,
  fetchUserThreads,
  deleteThread,
  resetData,
} = profileComposable

// 계산된 속성
const isOwnProfile = computed(() => {
  return auth.user?.username === username.value
})

const tabs = computed(() => [
  {
    key: 'books',
    label: '나의 책',
    count: booksPagination.value.totalCount,
  },
  {
    key: 'comments',
    label: '댓글/대댓글',
    count: commentsPagination.value.totalCount,
  },
  {
    key: 'threads',
    label: '내 쓰레드',
    count: threadsPagination.value.totalCount,
  },
])

// 메서드
const fetchProfile = async () => {
  if (!username.value) {
    error.value = '사용자 정보를 찾을 수 없습니다.'
    loading.value = false
    return
  }

  try {
    loading.value = true
    error.value = null
    imageError.value = false // 프로필 새로 로드할 때 이미지 에러 상태 초기화

    const response = await api.get(`/auth/auth/profile/${username.value}/`)
    profile.value = response.data

    console.log('✅ 프로필 조회 성공:', profile.value)
    console.log('🖼️ 프로필 이미지 URL:', profile.value.profile_picture_url)
  } catch (err) {
    console.error('❌ 프로필 조회 실패:', err)
    error.value = err.response?.data?.detail || '프로필을 불러오는데 실패했습니다.'

    if (err.response?.status === 401 && !auth.isAuthenticated) {
      router.push({ name: 'Login' })
    }
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  try {
    const response = await api.get('/auth/auth/categories/')
    allCategories.value = response.data
  } catch (err) {
    console.error('❌ 카테고리 조회 실패:', err)
  }
}

const toggleFollow = async () => {
  if (!auth.isAuthenticated) {
    showToast('로그인이 필요합니다.', 'error')
    return
  }

  try {
    followLoading.value = true
    const response = await api.post(`/auth/auth/profile/${username.value}/follow/`)

    profile.value.is_following = response.data.is_following
    profile.value.followers_count = response.data.followers_count

    showToast(response.data.is_following ? '팔로우 했습니다.' : '팔로우를 해제했습니다.', 'success')
  } catch (err) {
    console.error('❌ 팔로우 처리 실패:', err)
    showToast('팔로우 처리에 실패했습니다.', 'error')
  } finally {
    followLoading.value = false
  }
}

const toggleEditMode = () => {
  if (isEditing.value) {
    cancelEdit()
  } else {
    startEdit()
  }
}

const startEdit = () => {
  isEditing.value = true
  editForm.value = {
    weekly_read_time: profile.value.weekly_read_time || 0,
    yearly_read_count: profile.value.yearly_read_count || 0,
    category_ids: profile.value.categories?.map((cat) => cat.id) || [],
  }
  profilePictureFile.value = null
  profilePictureError.value = ''
  categoriesError.value = ''
}

const cancelEdit = () => {
  isEditing.value = false
  profilePictureFile.value = null
  profilePictureError.value = ''
  categoriesError.value = ''
}

const handleProfilePictureChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (!file.type.startsWith('image/')) {
      profilePictureError.value = '이미지 파일만 업로드 가능합니다.'
      profilePictureFile.value = null
    } else if (file.size > 5 * 1024 * 1024) {
      profilePictureError.value = '파일 크기가 5MB를 초과합니다.'
      profilePictureFile.value = null
    } else {
      profilePictureError.value = ''
      profilePictureFile.value = file
    }
  }
}

const toggleCategory = (categoryId) => {
  const index = editForm.value.category_ids.indexOf(categoryId)
  if (index === -1) {
    editForm.value.category_ids.push(categoryId)
  } else {
    editForm.value.category_ids.splice(index, 1)
  }

  if (editForm.value.category_ids.length > 0) {
    categoriesError.value = ''
  }
}

const saveProfile = async () => {
  if (editForm.value.category_ids.length === 0) {
    categoriesError.value = '최소 하나의 관심 장르를 선택해주세요.'
    return
  }

  try {
    saveLoading.value = true
    const formData = new FormData()

    // 변경된 필드만 추가
    if (editForm.value.weekly_read_time !== profile.value.weekly_read_time) {
      formData.append('weekly_read_time', editForm.value.weekly_read_time)
    }
    if (editForm.value.yearly_read_count !== profile.value.yearly_read_count) {
      formData.append('yearly_read_count', editForm.value.yearly_read_count)
    }

    const currentCategoryIds = profile.value.categories?.map((cat) => cat.id).sort() || []
    const newCategoryIds = editForm.value.category_ids.sort()

    if (JSON.stringify(currentCategoryIds) !== JSON.stringify(newCategoryIds)) {
      editForm.value.category_ids.forEach((id) => {
        formData.append('category_ids', id)
      })
    }

    if (profilePictureFile.value) {
      formData.append('profile_picture', profilePictureFile.value)
    }

    // 변경사항이 없으면 종료
    if (formData.entries().next().done && !profilePictureFile.value) {
      showToast('변경된 정보가 없습니다.', 'info')
      isEditing.value = false
      return
    }

    const response = await api.patch(`/auth/auth/profile/${username.value}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    profile.value = response.data
    isEditing.value = false
    imageError.value = false // 프로필 업데이트 후 이미지 에러 상태 초기화
    console.log('🖼️ 업데이트된 프로필 이미지 URL:', response.data.profile_picture_url)
    showToast('프로필 정보가 수정되었습니다.', 'success')
  } catch (err) {
    console.error('❌ 프로필 수정 실패:', err)
    handleFormError(err)
  } finally {
    saveLoading.value = false
  }
}

const handleFormError = (err) => {
  if (err.response?.data) {
    const data = err.response.data
    if (data.weekly_read_time) {
      showToast(`주간 평균 독서 시간: ${data.weekly_read_time[0]}`, 'error')
    } else if (data.yearly_read_count) {
      showToast(`연간 독서량: ${data.yearly_read_count[0]}`, 'error')
    } else if (data.category_ids) {
      categoriesError.value = `관심 장르: ${data.category_ids[0]}`
    } else if (data.profile_picture) {
      profilePictureError.value = `프로필 사진: ${data.profile_picture[0]}`
    } else {
      showToast(data.detail || '프로필 수정에 실패했습니다.', 'error')
    }
  } else {
    showToast('프로필 수정에 실패했습니다.', 'error')
  }
}

// 탭 관리
const setActiveTab = async (tabKey) => {
  activeTab.value = tabKey

  if (!isOwnProfile.value) return

  try {
    switch (tabKey) {
      case 'books':
        if (userBooks.value.length === 0) {
          await fetchUserBooks()
        }
        break
      case 'comments':
        if (userComments.value.length === 0) {
          await fetchUserComments()
        }
        break
      case 'threads':
        if (userThreads.value.length === 0) {
          await fetchUserThreads()
        }
        break
    }
  } catch (err) {
    console.error(`❌ ${tabKey} 데이터 로딩 실패:`, err)
  }
}

// 이벤트 핸들러
const handleRemoveBook = async (bookId) => {
  try {
    await toggleBookSave(bookId)
  } catch (err) {
    console.error('❌ 도서 저장 해제 실패:', err)
  }
}

const handleDeleteComment = async (commentId) => {
  try {
    await deleteComment(commentId)
  } catch (err) {
    console.error('❌ 댓글 삭제 실패:', err)
  }
}

const handleDeleteReply = async (replyId) => {
  try {
    await deleteReply(replyId)
  } catch (err) {
    console.error('❌ 대댓글 삭제 실패:', err)
  }
}

const handleDeleteThread = async (threadId) => {
  try {
    await deleteThread(threadId)
  } catch (err) {
    console.error('❌ 쓰레드 삭제 실패:', err)
  }
}

const handleBooksPageChange = async (page) => {
  try {
    await fetchUserBooks(page)
  } catch (err) {
    console.error('❌ 도서 페이지 변경 실패:', err)
  }
}

const handleCommentsPageChange = async (page) => {
  try {
    await fetchUserComments(page)
  } catch (err) {
    console.error('❌ 댓글 페이지 변경 실패:', err)
  }
}

const handleThreadsPageChange = async (page) => {
  try {
    await fetchUserThreads(page)
  } catch (err) {
    console.error('❌ 쓰레드 페이지 변경 실패:', err)
  }
}

// 유틸리티 함수
const goHome = () => {
  router.push('/')
}

const getProfileImageUrl = (url) => {
  console.log('🖼️ 프로필 이미지 URL 처리:', url)

  if (!url) {
    console.log('❌ URL이 없음 - 기본 이미지 사용')
    imageError.value = true
    return '/default-avatar.png'
  }

  // 이미 완전한 URL인 경우
  if (url.startsWith('http')) {
    console.log('✅ 완전한 URL:', url)
    return url
  }

  // 상대 경로인 경우 API 베이스 URL과 결합
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
  const fullUrl = url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`

  console.log('🔗 결합된 URL:', fullUrl)
  return fullUrl
}

const handleImageError = (event) => {
  console.log('❌ 프로필 이미지 로딩 실패:', event.target.src)
  imageError.value = true
}

const handleImageLoad = () => {
  console.log('✅ 프로필 이미지 로딩 성공')
  imageError.value = false
}

const handleDefaultImageError = (event) => {
  console.log('❌ 기본 아바타 이미지도 로딩 실패')
  // 기본 이미지도 실패하면 텍스트로 대체
  event.target.style.display = 'none'
  const container = event.target.parentElement
  if (!container.querySelector('.avatar-fallback')) {
    const fallback = document.createElement('div')
    fallback.className = 'avatar-fallback profile-avatar'
    fallback.textContent = profile.value?.username?.charAt(0)?.toUpperCase() || '?'
    container.appendChild(fallback)
  }
}

const genderToKorean = (gender) => {
  if (gender === 'male') return '남성'
  if (gender === 'female') return '여성'
  return gender || '미입력'
}

const showToast = (message, type = 'success') => {
  toastMessage.value = message
  toastType.value = type
  setTimeout(() => {
    toastMessage.value = ''
  }, 3000)
}

// 라이프사이클
onMounted(async () => {
  console.log('🚀 ProfileView 마운트됨')

  if (!auth.isAuthenticated) {
    router.push({ name: 'Login' })
    return
  }

  await fetchProfile()
  await fetchCategories()

  // 본인 프로필이면 첫 번째 탭 데이터 로드
  if (isOwnProfile.value) {
    await setActiveTab('books')
  }
})

// 라우트 변경 감지
watch(
  () => route.params.username,
  async (newUsername, oldUsername) => {
    if (newUsername && newUsername !== oldUsername) {
      resetData()
      await fetchProfile()

      if (isOwnProfile.value) {
        await setActiveTab('books')
      }
    }
  },
)

// 인증 상태 변경 감지
watch(
  () => auth.isAuthenticated,
  (isAuth) => {
    if (!isAuth) {
      router.push({ name: 'Login' })
    }
  },
)
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 0;
}

/* 헤더 */
.profile-header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  position: sticky;
  top: 0;
  z-index: 100;
}

.home-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.home-btn:hover {
  background: #5a6fd8;
  transform: translateY(-1px);
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
}

/* 로딩 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  color: white;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 프로필 컨텐츠 */
.profile-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

/* 프로필 기본 정보 */
.profile-basic-info {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.profile-avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.5rem;
}

.avatar-container {
  position: relative;
  width: 120px;
  height: 120px;
  margin-bottom: 1rem;
}

.profile-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #667eea;
  transition: opacity 0.3s ease;
}

.avatar-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #667eea;
  color: white;
  font-size: 2.5rem;
  font-weight: 700;
  text-transform: uppercase;
}

.profile-username {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.profile-stats {
  display: flex;
  gap: 2rem;
  justify-content: center;
  margin-bottom: 1rem;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #667eea;
}

.stat-label {
  font-size: 0.9rem;
  color: #718096;
}

.follow-btn {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
}

.follow-btn.following {
  background: #e2e8f0;
  color: #4a5568;
}

.follow-btn.not-following {
  background: #667eea;
  color: white;
}

.follow-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.follow-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* 프로필 상세 정보 */
.profile-details-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h3 {
  font-size: 1.3rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
}

.edit-toggle-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-toggle-btn:hover {
  background: #5a6fd8;
}

/* 프로필 보기 모드 */
.profile-details-view {
  display: grid;
  gap: 1rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 12px;
  border-left: 4px solid #667eea;
}

.detail-label {
  font-weight: 600;
  color: #4a5568;
}

.detail-value {
  color: #2d3748;
  font-weight: 500;
}

/* 프로필 수정 모드 */
.profile-details-edit {
  background: #f7fafc;
  border-radius: 12px;
  padding: 1.5rem;
}

.edit-form {
  display: grid;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #4a5568;
}

.form-group input {
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.category-chip {
  padding: 0.5rem 1rem;
  background: #e2e8f0;
  border: 2px solid transparent;
  border-radius: 20px;
  text-align: center;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.category-chip:hover {
  background: #cbd5e0;
}

.category-chip.selected {
  background: #667eea;
  color: white;
  border-color: #5a6fd8;
}

.error-text {
  color: #e53e3e;
  font-size: 0.9rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.save-btn,
.cancel-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.save-btn {
  background: #48bb78;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: #38a169;
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cancel-btn {
  background: #e2e8f0;
  color: #4a5568;
}

.cancel-btn:hover {
  background: #cbd5e0;
}

/* 활동 섹션 */
.activity-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.tabs-container {
  width: 100%;
}

.tabs-header {
  display: flex;
  border-bottom: 2px solid #e2e8f0;
  margin-bottom: 2rem;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  font-size: 1rem;
  font-weight: 600;
  color: #718096;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  color: #4a5568;
  background: #f7fafc;
}

.tab-btn.active {
  color: #667eea;
  border-bottom-color: #667eea;
  background: #f7fafc;
}

.tab-count {
  font-size: 0.8rem;
  color: #a0aec0;
}

.tab-content {
  min-height: 300px;
}

/* 다른 사용자 메시지 */
.other-user-message {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 3rem 2rem;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.message-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.message-content h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #4a5568;
  margin: 0;
}

.message-content p {
  color: #718096;
  font-size: 1.1rem;
  margin: 0;
}

/* 에러 상태 */
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 2rem;
}

.error-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 3rem 2rem;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  max-width: 400px;
}

.error-content h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #e53e3e;
  margin: 1rem 0;
}

.error-content p {
  color: #718096;
  margin-bottom: 2rem;
}

.retry-btn {
  padding: 0.75rem 2rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-btn:hover {
  background: #5a6fd8;
  transform: translateY(-1px);
}

/* 토스트 메시지 */
.toast {
  position: fixed;
  top: 2rem;
  right: 2rem;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  z-index: 1000;
  animation: slideIn 0.3s ease;
}

.toast.success {
  background: #48bb78;
}

.toast.error {
  background: #e53e3e;
}

.toast.info {
  background: #4299e1;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .profile-content {
    padding: 1rem;
  }

  .profile-basic-info,
  .profile-details-section,
  .activity-section {
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .profile-stats {
    gap: 1rem;
  }

  .tabs-header {
    flex-direction: column;
  }

  .tab-btn {
    justify-content: center;
    padding: 0.75rem;
  }

  .categories-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }

  .form-actions {
    flex-direction: column;
  }

  .toast {
    right: 1rem;
    left: 1rem;
    top: 1rem;
  }
}

@media (max-width: 480px) {
  .profile-header-bar {
    padding: 1rem;
  }

  .page-title {
    font-size: 1.3rem;
  }

  .home-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
  }

  .profile-avatar {
    width: 100px;
    height: 100px;
  }

  .profile-username {
    font-size: 1.5rem;
  }

  .detail-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
