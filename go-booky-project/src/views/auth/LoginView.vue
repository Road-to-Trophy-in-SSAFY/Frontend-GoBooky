<template>
  <div class="login-container">
    <form @submit.prevent="handleSubmit" class="login-form">
      <h2>로그인</h2>
      <div class="form-group">
        <SanitizedInput v-model="email" type="email" placeholder="이메일" inputClass="form-input" />
        <span v-if="errors.email" class="error">{{ errors.email }}</span>
      </div>
      <div class="form-group password-input-wrapper">
        <SanitizedInput
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="비밀번호"
          inputClass="form-input"
          autocomplete="current-password"
        />
        <button type="button" class="toggle-password" @click="togglePassword" tabindex="-1">
          <svg
            v-if="showPassword"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#888"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#888"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M17.94 17.94A10.94 10.94 0 0 1 12 19C5 19 1 12 1 12a21.81 21.81 0 0 1 5.06-7.94"
            />
            <path d="M22.54 12.88A10.94 10.94 0 0 0 23 12s-4-7-11-7a10.94 10.94 0 0 0-4.06.76" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        </button>
        <span v-if="errors.password" class="error">{{ errors.password }}</span>
      </div>
      <button type="submit" class="submit-button">로그인</button>
      <div class="back-link">
        <RouterLink to="/">&leftarrow; 시작 페이지로</RouterLink>
      </div>
    </form>
    <Modal v-if="modalText" :text="modalText" @close="modalText = ''" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useRouter } from 'vue-router'
import SanitizedInput from '@/components/common/SanitizedInput.vue'
import Modal from '@/components/ui/Modal.vue'
import { useValidation, combinedSchemas } from '@/composables/useValidation'

const { login, error: authError } = useAuth()
const router = useRouter()
const email = ref('')
const password = ref('')
const modalText = ref('')
const showPassword = ref(false)

// 지침에 따른 검증 시스템 사용
const { errors, validate, clearErrors } = useValidation(combinedSchemas.login)

// 컴포넌트 마운트 시 localStorage에서 이메일 복원
onMounted(() => {
  email.value = localStorage.getItem('login_email') || ''
})

// 이메일이 변경될 때마다 localStorage에 저장
watch(email, (newValue) => {
  localStorage.setItem('login_email', newValue)
})

function togglePassword() {
  showPassword.value = !showPassword.value
}

const handleSubmit = async () => {
  clearErrors()

  // 지침에 따른 유효성 검사
  const isValid = await validate({
    email: email.value,
    password: password.value,
  })

  if (!isValid) {
    console.log('❌ [LoginView] 폼 검증 실패')
    return
  }

  // 로그인 시도
  const success = await login(email.value, password.value)

  if (success) {
    // 로그인 성공 시 성공 메시지 표시
    modalText.value = '로그인 성공!'
    setTimeout(() => {
      router.push('/') // 홈페이지로 리다이렉트
    }, 500)
    password.value = '' // 로그인 성공 후 비밀번호 초기화
  } else {
    // 로그인 실패 시 에러 메시지 표시 (항상 한국어로 통일)
    modalText.value = '이메일 혹은 비밀번호를 잘못 입력하였습니다. 다시 시도해주세요.'
    password.value = '' // 로그인 실패 시 비밀번호 초기화
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 1rem;
}

.login-form {
  background: white;
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 400px;
  box-sizing: border-box;
}

.login-form h2 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 2rem;
  font-size: 1.75rem;
  font-weight: 600;
}

.form-group {
  margin-bottom: 1.5rem;
  position: relative;
  width: 100%;
}

.form-input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background-color: #f8fafc;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #42b983;
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.1);
  background-color: #fff;
}

.password-input-wrapper {
  position: relative;
  width: 100%;
}

.password-input-wrapper .form-input {
  padding-right: 3rem;
}

.toggle-password {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  color: #64748b;
  transition: color 0.2s ease;
  z-index: 1;
}

.toggle-password:hover {
  color: #42b983;
}

.error {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  display: block;
}

.submit-button {
  width: 100%;
  padding: 0.875rem;
  margin-top: 1.5rem;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.submit-button:hover {
  background: #3aa876;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(66, 185, 131, 0.2);
}

.submit-button:active {
  transform: translateY(0);
  box-shadow: none;
}

.back-link {
  text-align: center;
  margin-top: 1.5rem;
}

.back-link a {
  display: inline-block;
  color: #525f7f;
  text-decoration: none;
  font-size: 1rem;
  transition:
    color 0.3s ease,
    transform 0.2s ease;
  padding: 0.5rem 1rem;
  border-radius: 8px;
}

.back-link a:hover {
  color: #42b983;
  text-decoration: none;
}

@media (max-width: 480px) {
  .login-form {
    padding: 2rem 1.5rem;
  }

  .login-form h2 {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .form-input {
    padding: 0.75rem;
  }
}
</style>
