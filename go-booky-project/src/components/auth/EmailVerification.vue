<template>
  <div class="verify-container">
    <h2>이메일 인증</h2>
    <p v-if="message">{{ message }}</p>
    <p v-else>메일함에서 인증 링크를 클릭해 주세요.</p>
    <button @click="resendEmail" :disabled="resendDisabled">인증 메일 재전송</button>
    <span v-if="resendDisabled">({{ resendTimer }}초 후 재전송 가능)</span>
    <Modal v-if="modalText" :text="modalText" @close="modalText = ''" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Modal from '../ui/Modal.vue'
import api from '@/api'

const resendDisabled = ref(false)
const resendTimer = ref(60)
const modalText = ref('')
const message = ref('')
let resendInterval = null

const route = useRoute()

function handleError(err) {
  modalText.value = err.response?.data?.detail || err.message
}

onMounted(async () => {
  const uuid = route.params.uuid
  if (uuid) {
    try {
      const res = await api.get(`/auth/auth/verify-email/${uuid}/`)
      if (res.status === 200) {
        modalText.value = res.data.detail || '이메일 인증이 완료되었습니다. 다음을 진행해주세요.'
        message.value = ''
      } else {
        message.value = res.data?.detail || '이메일 인증 중 오류가 발생했습니다.'
        modalText.value = ''
      }
    } catch (err) {
      handleError(err)
    }
  }
})

const resendEmail = async () => {
  resendDisabled.value = true
  try {
    const email = sessionStorage.getItem('pending_email')
    if (!email) {
      modalText.value = '이메일 정보가 없습니다. 회원가입을 다시 진행해 주세요.'
      return
    }
    await api.post('/auth/auth/resend-email/', { email })
    modalText.value = '인증 메일이 재전송되었습니다.'
    startResendTimer()
  } catch (err) {
    handleError(err)
  }
}

function startResendTimer() {
  resendTimer.value = 60
  resendDisabled.value = true
  clearInterval(resendInterval)
  resendInterval = setInterval(() => {
    resendTimer.value--
    if (resendTimer.value <= 0) {
      resendDisabled.value = false
      clearInterval(resendInterval)
    }
  }, 1000)
}
</script>

<style scoped>
.verify-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  text-align: center;
}
button {
  margin-top: 1rem;
  background: #42b983;
  color: #fff;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
}
</style>
