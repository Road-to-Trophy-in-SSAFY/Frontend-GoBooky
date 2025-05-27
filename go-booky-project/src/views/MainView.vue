<template>
  <div class="app-layout">
    <!-- 현대적인 네비게이션 바 -->
    <nav class="navbar">
      <div class="nav-container">
        <!-- 로고 및 브랜드 -->
        <div class="nav-brand">
          <RouterLink :to="{ name: 'home' }" class="brand-link">
            <img v-if="!isHomePage" src="/logo.png" alt="GoBooky Logo" class="logo" />
            <span v-if="isHomePage" class="brand-text"> GoBooky </span>
          </RouterLink>
        </div>

        <!-- 메인 네비게이션 메뉴 -->
        <div class="nav-menu" :class="{ 'nav-menu-open': isMobileMenuOpen }">
          <div class="nav-links">
            <RouterLink
              :to="{ path: '/' }"
              class="nav-link"
              @click="closeMobileMenu"
              exact-active-class="router-link-exact-active"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M9 22V12H15V22"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <span>홈</span>
            </RouterLink>

            <RouterLink
              :to="{ name: 'books' }"
              class="nav-link"
              @click="closeMobileMenu"
              exact-active-class="router-link-exact-active"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M6.5 2H20V22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5V4.5C4 3.83696 4.26339 3.20107 4.73223 2.73223C5.20107 2.26339 5.83696 2 6.5 2Z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <span>도서</span>
            </RouterLink>

            <RouterLink
              :to="{ name: 'threads' }"
              class="nav-link"
              @click="closeMobileMenu"
              exact-active-class="router-link-exact-active"
            >
              <svg
                width="20"
                height="20"
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
                <path
                  d="M10 9H9H8"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <span>독서 기록</span>
            </RouterLink>
          </div>

          <!-- 사용자 메뉴 -->
          <div class="nav-user">
            <template v-if="isAuthenticated">
              <!-- 사용자 프로필 드롭다운 -->
              <div class="user-dropdown" ref="userDropdownRef">
                <button @click="toggleUserMenu" class="user-button">
                  <div class="user-avatar">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <circle
                        cx="12"
                        cy="7"
                        r="4"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </div>
                  <span class="user-name">{{ user?.username || '사용자' }}</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    class="dropdown-arrow"
                    :class="{ 'dropdown-arrow-open': isUserMenuOpen }"
                  >
                    <path
                      d="M6 9L12 15L18 9"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>

                <div v-if="isUserMenuOpen" class="user-menu">
                  <RouterLink
                    :to="{ name: 'profile', params: { username: user?.username } }"
                    v-if="user?.username"
                    class="user-menu-item"
                    @click="closeUserMenu"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <circle
                        cx="12"
                        cy="7"
                        r="4"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                    마이페이지
                  </RouterLink>

                  <button @click="openDeleteModal" class="user-menu-item danger">
                    <svg
                      width="16"
                      height="16"
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
                    회원탈퇴
                  </button>

                  <button @click="handleLogout" class="user-menu-item">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M16 17L21 12L16 7"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M21 12H9"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                    로그아웃
                  </button>
                </div>
              </div>
            </template>

            <template v-else>
              <div class="auth-buttons">
                <RouterLink to="/login" class="auth-button login-button" @click="closeMobileMenu">
                  <svg
                    width="18"
                    height="18"
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
                  로그인
                </RouterLink>
                <RouterLink to="/signup" class="auth-button signup-button" @click="closeMobileMenu">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <circle
                      cx="8.5"
                      cy="7"
                      r="4"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M20 8V14"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M23 11H17"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  회원가입
                </RouterLink>
              </div>
            </template>
          </div>
        </div>

        <!-- 모바일 메뉴 토글 버튼 -->
        <button @click="toggleMobileMenu" class="mobile-menu-toggle">
          <svg
            v-if="!isMobileMenuOpen"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 12H21M3 6H21M3 18H21"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <svg
            v-else
            width="24"
            height="24"
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
        </button>
      </div>
    </nav>

    <!-- 메인 컨텐츠 -->
    <main class="main-content">
      <RouterView :key="$route.fullPath" />
    </main>

    <!-- 모달들 -->
    <div class="modal-container">
      <Modal v-if="modalText" :text="modalText" @close="modalText = ''" />
      <DeleteAccountModal
        v-if="showDeleteModal"
        ref="deleteModalRef"
        :isLoading="isDeleting"
        @close="closeDeleteModal"
        @confirm="handleDeleteConfirm"
        @success="handleDeleteSuccess"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute, RouterLink, RouterView } from 'vue-router'
import Modal from '@/components/ui/Modal.vue'
import DeleteAccountModal from '@/components/ui/DeleteAccountModal.vue'
import { useAuth } from '@/composables/useAuth'
import { authAPI } from '@/api/auth'
import { getDeleteAccountErrorMessage } from '@/utils/errorMessages'
import { toast } from '@/composables/useToast'

// 지침에 따른 Composables 사용
const { user, isAuthenticated, logout } = useAuth()
const router = useRouter()
const route = useRoute()
const modalText = ref('')
const showDeleteModal = ref(false)
const isDeleting = ref(false)
const deleteModalRef = ref(null)

// 홈 페이지 여부 확인
const isHomePage = computed(() => {
  return route.name === 'home' || route.path === '/'
})

// 모바일 메뉴 상태
const isMobileMenuOpen = ref(false)
const isUserMenuOpen = ref(false)
const userDropdownRef = ref(null)

// 모바일 메뉴 토글
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  if (isMobileMenuOpen.value) {
    isUserMenuOpen.value = false
  }
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

// 사용자 메뉴 토글
const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value
}

const closeUserMenu = () => {
  isUserMenuOpen.value = false
  isMobileMenuOpen.value = false
}

// 외부 클릭 시 메뉴 닫기
const handleClickOutside = (event) => {
  if (userDropdownRef.value && !userDropdownRef.value.contains(event.target)) {
    isUserMenuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const handleLogout = async () => {
  try {
    closeUserMenu()
    await logout()
    // 로그아웃 성공 시 홈으로 이동 (useAuth에서 이미 처리됨)
    router.push('/')
    console.log('✅ [MainView] 로그아웃 성공')
  } catch (error) {
    console.error('❌ [MainView] 로그아웃 실패:', error)
    // 전역 Toast 시스템에서 처리되므로 별도 모달 불필요
    // modalText.value = '로그아웃 중 오류가 발생했습니다.'
  }
}

function openDeleteModal() {
  closeUserMenu()
  showDeleteModal.value = true
}

function closeDeleteModal() {
  showDeleteModal.value = false
  isDeleting.value = false
}

const handleDeleteConfirm = async (password) => {
  isDeleting.value = true

  try {
    await authAPI.deleteAccount({ password })

    // 회원탈퇴 성공 Toast 표시
    toast.success('회원탈퇴가 완료되었습니다.')

    // 로그아웃 처리 (모든 스토어 초기화 포함)
    await logout()

    // 성공 단계 표시
    deleteModalRef.value?.showSuccess()
    console.log('✅ [MainView] 회원탈퇴 성공')
  } catch (err) {
    console.error('❌ [MainView] 회원탈퇴 실패:', err)
    isDeleting.value = false

    const errorMessage = getDeleteAccountErrorMessage(err)
    deleteModalRef.value?.showPasswordError(errorMessage)
  }
}

const handleDeleteSuccess = () => {
  showDeleteModal.value = false
  router.push('/')
}
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  background: #f8fafc;
}

/* 네비게이션 바 */
.navbar {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
}

/* 브랜드 */
.nav-brand {
  flex-shrink: 0;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: #1f2937;
  font-weight: 700;
  font-size: 20px;
  transition: color 0.2s ease;
}

.brand-link:hover {
  color: #3b82f6;
}

.logo {
  height: 40px;
  width: auto;
  max-width: 120px;
  border-radius: 8px;
  object-fit: contain;
}

.brand-text {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 네비게이션 메뉴 */
.nav-menu {
  display: flex;
  align-items: center;
  gap: 32px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  text-decoration: none;
  color: #6b7280;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.2s ease;
  position: relative;
}

.nav-link:hover {
  color: #3b82f6;
  background: #f1f5f9;
}

.nav-link.router-link-exact-active {
  color: #3b82f6;
  background: #eff6ff;
  font-weight: 600;
}

.nav-link.router-link-exact-active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 2px;
  background: #3b82f6;
  border-radius: 1px;
}

/* 사용자 메뉴 */
.nav-user {
  position: relative;
}

.user-dropdown {
  position: relative;
}

.user-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: none;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #374151;
  font-weight: 500;
}

.user-button:hover {
  border-color: #3b82f6;
  background: #f8faff;
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.user-name {
  font-size: 14px;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-arrow {
  transition: transform 0.2s ease;
}

.dropdown-arrow-open {
  transform: rotate(180deg);
}

.user-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  overflow: hidden;
  z-index: 1001;
}

.user-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  text-align: left;
  text-decoration: none;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.user-menu-item:hover {
  background: #f3f4f6;
}

.user-menu-item.danger {
  color: #dc2626;
}

.user-menu-item.danger:hover {
  background: #fef2f2;
}

/* 인증 버튼 */
.auth-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
}

.auth-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;
}

.login-button {
  color: #3b82f6;
  border: 2px solid #3b82f6;
  background: white;
}

.login-button:hover {
  background: #3b82f6;
  color: white;
}

.signup-button {
  color: white;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border: 2px solid transparent;
}

.signup-button:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

/* 모바일 메뉴 토글 */
.mobile-menu-toggle {
  display: none;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.mobile-menu-toggle:hover {
  color: #3b82f6;
  background: #f1f5f9;
}

/* 메인 컨텐츠 */
.main-content {
  flex: 1;
  min-height: calc(100vh - 70px);
}

.modal-container {
  position: relative;
  z-index: 2000;
}

/* 반응형 디자인 */
@media (max-width: 1024px) {
  .nav-container {
    padding: 0 16px;
  }

  .nav-menu {
    gap: 24px;
  }

  .nav-links {
    gap: 4px;
  }
}

@media (max-width: 768px) {
  .nav-container {
    padding: 0 12px;
    height: 60px;
  }

  .logo {
    height: 32px;
    width: auto;
    max-width: 100px;
  }

  .brand-text {
    font-size: 18px;
  }

  .mobile-menu-toggle {
    display: block;
  }

  .nav-menu {
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    background: white;
    border-top: 1px solid #e2e8f0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    flex-direction: column;
    align-items: stretch;
    gap: 0;
    padding: 20px;
    transform: translateY(-100%);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
  }

  .nav-menu-open {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
  }

  .nav-links {
    flex-direction: column;
    gap: 8px;
    margin-bottom: 20px;
  }

  .nav-link {
    justify-content: flex-start;
    padding: 16px;
    border-radius: 12px;
    font-size: 16px;
  }

  .nav-user {
    border-top: 1px solid #e5e7eb;
    padding-top: 20px;
  }

  .user-button {
    width: 100%;
    justify-content: flex-start;
    padding: 16px;
    border-radius: 12px;
  }

  .user-menu {
    position: static;
    box-shadow: none;
    border: none;
    background: #f8f9fa;
    border-radius: 8px;
    margin-top: 12px;
  }

  .auth-buttons {
    flex-direction: column;
    gap: 12px;
  }

  .auth-button {
    justify-content: center;
    padding: 16px;
    font-size: 16px;
    border-radius: 12px;
  }

  .main-content {
    min-height: calc(100vh - 60px);
  }
}

@media (max-width: 480px) {
  .nav-container {
    padding: 0 8px;
  }

  .brand-text {
    display: none;
  }

  .nav-menu {
    padding: 16px;
  }

  .nav-links {
    margin-bottom: 16px;
  }

  .nav-user {
    padding-top: 16px;
  }
}

/* 애니메이션 */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.user-menu {
  animation: slideDown 0.2s ease;
}
</style>
