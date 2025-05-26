<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-container" @click.stop>
      <!-- 1단계: 초기 경고 -->
      <div v-if="step === 1" class="modal-content step-1">
        <div class="warning-icon">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#e74c3c"
            stroke-width="2"
          >
            <path
              d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
            />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <h3>회원탈퇴</h3>
        <div class="warning-message">
          <p><strong>정말로 계정을 삭제하시겠습니까?</strong></p>
          <div class="data-loss-warning">
            <h4>⚠️ 다음 데이터가 영구적으로 삭제됩니다:</h4>
            <ul>
              <li>프로필 정보 및 설정</li>
              <li>작성한 모든 쓰레드</li>
              <li>독서 기록 및 통계</li>
              <li>팔로우/팔로워 관계</li>
              <li>기타 모든 활동 내역</li>
            </ul>
            <p class="irreversible">이 작업은 되돌릴 수 없습니다.</p>
          </div>
        </div>
        <div class="button-group">
          <button class="cancel-button" @click="closeModal">취소</button>
          <button class="continue-button" @click="nextStep">계속 진행</button>
        </div>
      </div>

      <!-- 2단계: 비밀번호 확인 -->
      <div v-if="step === 2" class="modal-content step-2">
        <div class="lock-icon">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#e74c3c"
            stroke-width="2"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <circle cx="12" cy="16" r="1" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h3>비밀번호 확인</h3>
        <p class="password-instruction">계정 삭제를 위해 현재 비밀번호를 입력해주세요.</p>

        <div class="password-input-wrapper">
          <input
            ref="passwordInput"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="현재 비밀번호"
            class="password-input"
            :class="{ error: passwordError }"
            @keyup.enter="confirmDelete"
            @input="clearPasswordError"
          />
          <button type="button" class="toggle-password" @click="togglePassword" tabindex="-1">
            <svg
              v-if="showPassword"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#888"
              stroke-width="2"
            >
              <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <svg
              v-else
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#888"
              stroke-width="2"
            >
              <path
                d="M17.94 17.94A10.94 10.94 0 0 1 12 19C5 19 1 12 1 12a21.81 21.81 0 0 1 5.06-7.94"
              />
              <path d="M22.54 12.88A10.94 10.94 0 0 0 23 12s-4-7-11-7a10.94 10.94 0 0 0-4.06.76" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          </button>
        </div>

        <div v-if="passwordError" class="error-message">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ef4444"
            stroke-width="2"
            class="error-icon"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          {{ passwordError }}
        </div>

        <div class="button-group">
          <button class="back-button" @click="prevStep" :disabled="isLoading">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
            이전
          </button>
          <button class="delete-button" @click="confirmDelete" :disabled="!password || isLoading">
            <span v-if="isLoading" class="loading-content">
              <div class="spinner"></div>
              삭제 중...
            </span>
            <span v-else class="delete-content">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
              계정 삭제
            </span>
          </button>
        </div>
      </div>

      <!-- 3단계: 삭제 완료 -->
      <div v-if="step === 3" class="modal-content step-3">
        <div class="success-icon">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#27ae60"
            stroke-width="2"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <path d="M9 11l3 3L22 4" />
          </svg>
        </div>
        <h3>계정이 삭제되었습니다</h3>
        <p class="success-message">
          회원탈퇴가 완료되었습니다.<br />
          그동안 GoBooky를 이용해주셔서 감사했습니다.
        </p>
        <div class="redirect-info">
          <div class="loading-spinner"></div>
          <p>홈페이지로 이동 중...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted } from 'vue'

defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'confirm', 'success'])

const step = ref(1)
const password = ref('')
const passwordError = ref('')
const showPassword = ref(false)
const passwordInput = ref(null)

const nextStep = () => {
  step.value = 2
  nextTick(() => {
    passwordInput.value?.focus()
  })
}

const prevStep = () => {
  step.value = 1
  password.value = ''
  passwordError.value = ''
}

const closeModal = () => {
  emit('close')
}

const handleOverlayClick = () => {
  if (step.value !== 3) {
    // 완료 단계가 아닐 때만 닫기 가능
    closeModal()
  }
}

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const clearPasswordError = () => {
  passwordError.value = ''
}

const confirmDelete = () => {
  // 클라이언트 사이드 검증
  if (!password.value || password.value.trim() === '') {
    passwordError.value = '비밀번호를 입력해주세요.'
    return
  }

  if (password.value.length < 1) {
    passwordError.value = '비밀번호를 입력해주세요.'
    return
  }

  // 에러 초기화 후 서버로 요청
  passwordError.value = ''
  emit('confirm', password.value)
}

const showSuccess = () => {
  step.value = 3
  setTimeout(() => {
    emit('success')
  }, 2000)
}

const showPasswordError = (error) => {
  passwordError.value = error
  // 에러 발생 시 비밀번호 필드에 포커스
  nextTick(() => {
    passwordInput.value?.focus()
    passwordInput.value?.select() // 기존 텍스트 선택
  })
}

// ESC 키로 모달 닫기
const handleKeydown = (event) => {
  if (event.key === 'Escape' && step.value !== 3) {
    closeModal()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

// 부모 컴포넌트에서 호출할 수 있는 메서드들
defineExpose({
  showSuccess,
  showPasswordError,
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.3s ease-out;
}

.modal-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  max-width: 480px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease-out;
}

.modal-content {
  padding: 2rem;
  text-align: center;
}

/* 1단계 스타일 */
.step-1 .warning-icon {
  margin-bottom: 1rem;
  animation: pulse 2s infinite;
}

.step-1 h3 {
  color: #e74c3c;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.warning-message {
  text-align: left;
  margin-bottom: 2rem;
}

.warning-message > p {
  text-align: center;
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  color: #2c3e50;
}

.data-loss-warning {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.data-loss-warning h4 {
  color: #dc2626;
  font-size: 1rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

.data-loss-warning ul {
  list-style: none;
  padding: 0;
  margin: 0 0 1rem 0;
}

.data-loss-warning li {
  padding: 0.5rem 0;
  color: #7f1d1d;
  position: relative;
  padding-left: 1.5rem;
}

.data-loss-warning li::before {
  content: '•';
  color: #dc2626;
  position: absolute;
  left: 0;
  font-weight: bold;
}

.irreversible {
  color: #dc2626;
  font-weight: 600;
  font-size: 0.95rem;
  margin: 0;
  text-align: center;
}

/* 2단계 스타일 */
.step-2 .lock-icon {
  margin-bottom: 1rem;
}

.step-2 h3 {
  color: #2c3e50;
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.password-instruction {
  color: #64748b;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.password-input-wrapper {
  position: relative;
  margin-bottom: 1rem;
}

.password-input {
  width: 100%;
  padding: 0.875rem 3rem 0.875rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.password-input:focus {
  outline: none;
  border-color: #e74c3c;
  box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
}

.password-input.error {
  border-color: #ef4444;
  background-color: #fef2f2;
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
  color: #64748b;
  transition: color 0.2s ease;
}

.toggle-password:hover {
  color: #e74c3c;
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  text-align: left;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  padding: 0.75rem;
  animation: errorShake 0.5s ease-in-out;
}

.error-icon {
  flex-shrink: 0;
}

/* 3단계 스타일 */
.step-3 .success-icon {
  margin-bottom: 1rem;
  animation: successPulse 0.6s ease-out;
}

.step-3 h3 {
  color: #27ae60;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.success-message {
  color: #2c3e50;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.redirect-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #64748b;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #27ae60;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* 버튼 스타일 */
.button-group {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

.cancel-button,
.back-button {
  padding: 0.75rem 1.5rem;
  border: 2px solid #e2e8f0;
  background: white;
  color: #64748b;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cancel-button:hover,
.back-button:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
  color: #475569;
}

.continue-button {
  padding: 0.75rem 1.5rem;
  border: 2px solid #f59e0b;
  background: #f59e0b;
  color: white;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.continue-button:hover {
  background: #d97706;
  border-color: #d97706;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.delete-button {
  padding: 0.75rem 1.5rem;
  border: 2px solid #e74c3c;
  background: #e74c3c;
  color: white;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
}

.delete-button:hover:not(:disabled) {
  background: #c0392b;
  border-color: #c0392b;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
}

.delete-button:disabled {
  background: #94a3b8;
  border-color: #94a3b8;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.loading-content,
.delete-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* 애니메이션 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes successPulse {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes errorShake {
  0%,
  100% {
    transform: translateX(0);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-3px);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateX(3px);
  }
}

/* 반응형 디자인 */
@media (max-width: 480px) {
  .modal-container {
    width: 95%;
    margin: 1rem;
  }

  .modal-content {
    padding: 1.5rem;
  }

  .button-group {
    flex-direction: column;
  }

  .cancel-button,
  .back-button,
  .continue-button,
  .delete-button {
    width: 100%;
  }
}
</style>
