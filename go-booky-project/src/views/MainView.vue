<template>
  <nav>
    <RouterLink :to="{ name: 'home' }">
      <img src="/logo.png" alt="GoBooky Logo" class="logo" />
    </RouterLink>
    <RouterLink :to="{ name: 'home' }">Home</RouterLink>
    &nbsp;|&nbsp;
    <RouterLink :to="{ name: 'books' }">Books</RouterLink>
    &nbsp;|&nbsp;
    <RouterLink :to="{ name: 'threads' }">Threads</RouterLink>
    &nbsp;|&nbsp;
    <template v-if="isAuthenticated">
      <RouterLink
        :to="{ name: 'Profile', params: { username: user?.username } }"
        v-if="user?.username"
      >
        <button>마이페이지</button>
      </RouterLink>
      <button @click="openDeleteModal">회원탈퇴</button>
      <button @click="handleLogout">로그아웃</button>
    </template>
    <template v-else>
      <RouterLink to="/login"><button>로그인</button></RouterLink>
      <RouterLink to="/signup"><button>회원가입</button></RouterLink>
    </template>
  </nav>
  <div>
    <RouterView />
  </div>
  <div class="main-container">
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
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, RouterLink, RouterView } from 'vue-router'
import Modal from '@/components/ui/Modal.vue'
import DeleteAccountModal from '@/components/ui/DeleteAccountModal.vue'
import { useAuth } from '@/composables/useAuth'
import { authAPI } from '@/api/auth'
import { getDeleteAccountErrorMessage } from '@/utils/errorMessages'
import { toast } from '@/composables/useToast'

// 지침에 따른 Composables 사용
const { user, isAuthenticated, logout } = useAuth()
const router = useRouter()
const modalText = ref('')
const showDeleteModal = ref(false)
const isDeleting = ref(false)
const deleteModalRef = ref(null)

const handleLogout = async () => {
  try {
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
nav {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 1rem 2rem;
  background: #f5f5f5;
}
nav .logo {
  height: 48px;
  margin-right: 20px;
}
nav button {
  margin-left: 10px;
  background: #42b983;
  color: #fff;
  border: none;
  padding: 0.5rem 1.2rem;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
}
</style>
