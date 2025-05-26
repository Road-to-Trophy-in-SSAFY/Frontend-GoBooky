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
    <Modal v-if="showDeleteModal" @close="closeDeleteModal">
      <template #default>
        <div style="margin-bottom: 1rem">정말 계정을 삭제하시겠습니까?</div>
        <input
          v-model="deletePassword"
          type="password"
          placeholder="비밀번호 입력"
          style="margin-bottom: 1rem"
        />
        <div style="display: flex; gap: 1rem; justify-content: center">
          <button @click="closeDeleteModal">취소</button>
          <button @click="handleWithdraw" style="background: #e74c3c">삭제</button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, RouterLink, RouterView } from 'vue-router'
import Modal from '@/components/ui/Modal.vue'
import { useAuth } from '@/composables/useAuth'
import { authAPI } from '@/api/auth'

// 지침에 따른 Composables 사용
const { user, isAuthenticated, logout } = useAuth()
const router = useRouter()
const modalText = ref('')
const showDeleteModal = ref(false)
const deletePassword = ref('')

function handleError(err, fallbackMsg = '회원탈퇴 실패') {
  modalText.value = err.response?.data?.detail || fallbackMsg
}

const handleLogout = async () => {
  try {
    await logout()
    router.push('/')
    console.log('✅ [MainView] 로그아웃 성공')
  } catch (error) {
    console.error('❌ [MainView] 로그아웃 실패:', error)
    modalText.value = '로그아웃 중 오류가 발생했습니다.'
  }
}

function openDeleteModal() {
  showDeleteModal.value = true
  deletePassword.value = ''
}
function closeDeleteModal() {
  showDeleteModal.value = false
  deletePassword.value = ''
}

const handleWithdraw = async () => {
  if (!deletePassword.value) {
    modalText.value = '비밀번호를 입력해주세요.'
    return
  }
  try {
    await authAPI.deleteAccount({ password: deletePassword.value })
    await logout()
    showDeleteModal.value = false
    modalText.value = '회원탈퇴가 완료되었습니다.'
    setTimeout(() => {
      router.push('/')
    }, 1000)
    console.log('✅ [MainView] 회원탈퇴 성공')
  } catch (err) {
    console.error('❌ [MainView] 회원탈퇴 실패:', err)
    handleError(err)
  }
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
