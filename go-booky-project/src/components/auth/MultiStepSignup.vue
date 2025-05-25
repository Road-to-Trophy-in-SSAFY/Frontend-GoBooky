<template>
  <div class="signup-container">
    <div class="step-progress">
      <div
        v-for="(label, idx) in stepLabels"
        :key="idx"
        :class="['step', { active: idx === currentStep }]"
      >
        {{ label }}
      </div>
    </div>
    <form @submit.prevent="handleNext">
      <div v-if="currentStep === 0">
        <div class="form-group">
          <SanitizedInput
            v-model="formState.form.email"
            type="email"
            placeholder="이메일"
            inputClass="form-control"
          />
          <span v-if="formState.errors.email" class="error">{{ formState.errors.email }}</span>
        </div>
        <div class="form-group">
          <SanitizedInput
            v-model="formState.form.password"
            type="password"
            placeholder="비밀번호"
            inputClass="form-control"
          />
          <div class="password-validation">
            <p
              v-for="(message, index) in passwordValidationMessages"
              :key="index"
              :class="{ valid: message.valid }"
            >
              {{ message.text }}
            </p>
          </div>
          <span v-if="formState.errors.password" class="error">{{
            formState.errors.password
          }}</span>
        </div>
        <div class="form-group">
          <SanitizedInput
            v-model="formState.form.passwordConfirm"
            type="password"
            placeholder="비밀번호 확인"
            inputClass="form-control"
          />
          <div class="password-match-container">
            <span
              v-if="formState.form.password"
              :class="['password-match', { match: isPasswordMatch }]"
            >
              {{ passwordMatchMessage }}
            </span>
          </div>
        </div>
      </div>
      <div v-else-if="currentStep === 1">
        <div v-if="formState.loading.check" class="verification-loading">
          <div class="spinner"></div>
          <p>이메일 인증 중...</p>
        </div>
        <div v-else class="verification-container">
          <div class="verification-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
              />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <div class="verification-content">
            <h3>이메일 인증</h3>
            <p class="verification-message">
              <span class="email-highlight">{{ formState.form.email }}</span
              >로<br />
              인증 메일이 발송되었습니다.<br />
              메일함을 확인해주세요.
            </p>
            <div class="verification-actions">
              <button
                type="button"
                @click="resendEmail"
                :disabled="formState.verification.resendDisabled || formState.loading.resend"
                class="btn btn-secondary"
              >
                <span v-if="formState.loading.resend" class="spinner-small"></span>
                <span v-else>재전송</span>
              </button>
              <span v-if="formState.verification.resendDisabled" class="resend-timer">
                {{ formState.verification.resendTimer }}초 후 재전송 가능
              </span>
              <button
                type="button"
                @click="checkEmailVerified"
                :disabled="formState.loading.check"
                class="btn btn-primary"
              >
                <span v-if="formState.loading.check" class="spinner-small"></span>
                <span v-else>이메일 인증 확인</span>
              </button>
            </div>
            <div v-if="formState.verification.verified" class="verification-success">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>인증 완료</span>
            </div>
          </div>
        </div>
      </div>
      <div v-else-if="currentStep === 2">
        <div class="form-group">
          <label for="username">닉네임</label>
          <div class="input-with-button">
            <SanitizedInput
              id="username"
              v-model="formState.form.username"
              type="text"
              placeholder="닉네임"
              inputClass="form-control"
              @input="resetNicknameCheck"
            />
            <button
              type="button"
              class="btn btn-secondary check-button"
              @click="checkNicknameAvailability"
              :disabled="!formState.form.username || formState.loading.nicknameCheck"
            >
              <span v-if="formState.loading.nicknameCheck" class="spinner-small"></span>
              <span v-else>중복 확인</span>
            </button>
          </div>
          <div class="nickname-check-message-container">
            <span
              v-if="formState.nicknameCheckMessage"
              :class="[
                'nickname-check-message',
                {
                  available: formState.isNicknameAvailable === true,
                  'not-available': formState.isNicknameAvailable === false,
                },
              ]"
            >
              {{ formState.nicknameCheckMessage }}
            </span>
          </div>
          <span v-if="formState.errors.username" class="error">{{
            formState.errors.username
          }}</span>
        </div>
        <div class="name-group">
          <div class="form-group">
            <label for="last_name">성</label>
            <SanitizedInput
              id="last_name"
              v-model="formState.form.last_name"
              type="text"
              placeholder="성"
              inputClass="form-control"
            />
            <span v-if="formState.errors.last_name" class="error">{{
              formState.errors.last_name
            }}</span>
          </div>
          <div class="form-group">
            <label for="first_name">이름</label>
            <SanitizedInput
              id="first_name"
              v-model="formState.form.first_name"
              type="text"
              placeholder="이름"
              inputClass="form-control"
            />
            <span v-if="formState.errors.first_name" class="error">{{
              formState.errors.first_name
            }}</span>
          </div>
        </div>
        <div class="form-group">
          <label for="gender">성별</label>
          <select id="gender" v-model="formState.form.gender" name="gender" class="form-control">
            <option value="">성별 선택</option>
            <option value="male">남성</option>
            <option value="female">여성</option>
          </select>
          <span v-if="formState.errors.gender" class="error">{{ formState.errors.gender }}</span>
        </div>
      </div>
      <div v-else-if="currentStep === 3">
        <div class="reading-info">
          <h3>독서 정보</h3>
          <div class="form-group">
            <label>주간 평균 독서 시간 (시간)</label>
            <SanitizedInput
              v-model.number="formState.form.weekly_read_time"
              type="number"
              min="0"
              placeholder="예: 2"
              inputClass="form-control"
            />
          </div>
          <div class="form-group">
            <label>연간 독서량 (권)</label>
            <SanitizedInput
              v-model.number="formState.form.yearly_read_count"
              type="number"
              min="0"
              placeholder="예: 24"
              inputClass="form-control"
            />
          </div>
        </div>
        <div class="categories">
          <h3>관심 장르 (최소 1개 이상 선택)</h3>
          <div class="category-grid">
            <div
              v-for="category in formState.categories"
              :key="category.id"
              :class="[
                'category-item',
                { selected: formState.form.category_ids.includes(category.id) },
              ]"
              @click="toggleCategory(category.id)"
            >
              {{ category.name }}
            </div>
          </div>
          <span v-if="formState.errors.category_ids" class="error">{{
            formState.errors.category_ids
          }}</span>
        </div>
      </div>
      <div v-else-if="currentStep === 4">
        <div class="completion-container">
          <div class="completion-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <p class="completion-message">회원가입이 완료되었습니다!</p>
          <div v-if="formState.loading.redirect" class="redirect-loader">
            <div class="spinner"></div>
            <p>로그인 페이지로 이동합니다...</p>
          </div>
        </div>
      </div>
      <div class="actions">
        <button
          v-if="!isLastStep"
          type="submit"
          class="btn btn-primary"
          :disabled="formState.loading.submit || !canProceed"
        >
          <span v-if="formState.loading.submit" class="spinner-small"></span>
          <span v-else>다음</span>
        </button>
      </div>
    </form>
    <Modal v-if="formState.modal.text" :text="formState.modal.text" @close="handleModalClose" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import Modal from '../ui/Modal.vue'
import SanitizedInput from '../common/SanitizedInput.vue'
import { useRouter } from 'vue-router'
import { useMultiStepForm } from '@/composables/useMultiStepForm'
import { useValidation, combinedSchemas } from '@/composables/useValidation'
import { authAPI } from '@/api/auth'

const router = useRouter()

// 지침에 따른 멀티스텝 폼 설정
const stepLabels = ['이메일 입력', '이메일 인증', '기본 정보', '독서 정보', '완료']
const stepConfigs = stepLabels.map((label, index) => ({
  id: index,
  title: label,
  required: index < 4, // 마지막 단계는 완료 단계
}))

const { currentStep, isLastStep, nextStep } = useMultiStepForm(stepConfigs)

// 지침에 따른 검증 시스템 - 기본 스키마로 초기화
const { validate, clearErrors } = useValidation(combinedSchemas.signup)

// 폼 상태를 하나의 객체로 통합
const formState = ref({
  form: {
    email: '',
    password: '',
    passwordConfirm: '',
    username: '',
    first_name: '',
    last_name: '',
    gender: '',
    weekly_read_time: null,
    yearly_read_count: null,
    category_ids: [],
  },
  errors: {},
  loading: {
    submit: false,
    resend: false,
    check: false,
    redirect: false,
    nicknameCheck: false,
  },
  verification: {
    uuid: '',
    verified: false,
    resendDisabled: false,
    resendTimer: 60,
  },
  modal: {
    text: '',
  },
  categories: [],
  nicknameCheckMessage: '',
  isNicknameAvailable: null,
})

// computed 속성으로 자주 사용되는 값들 캐싱
const canProceed = computed(() => {
  switch (currentStep.value) {
    case 0: {
      // 이메일과 비밀번호 유효성 검사
      const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.value.form.email)
      const passwordValid = passwordValidationMessages.value.every((msg) => msg.valid)
      const passwordMatch = formState.value.form.password === formState.value.form.passwordConfirm
      const hasPasswordConfirm = formState.value.form.passwordConfirm !== ''
      return emailValid && passwordValid && passwordMatch && hasPasswordConfirm
    }
    case 1:
      return formState.value.verification.verified
    case 2: {
      // 기본 정보 유효성 검사 및 닉네임 중복 확인
      const basicInfoValid =
        formState.value.form.username &&
        formState.value.form.first_name &&
        formState.value.form.last_name &&
        formState.value.form.gender
      return basicInfoValid && formState.value.isNicknameAvailable === true
    }
    case 3:
      // 독서 정보 유효성 검사
      return formState.value.form.category_ids.length > 0
    default:
      return true
  }
})

// 지침에 따른 단계별 검증 스키마 매핑
const getSchemaForStep = (step) => {
  switch (step) {
    case 0:
      return combinedSchemas.signupStep1
    case 1:
      return null // 이메일 인증은 별도 처리
    case 2:
      return combinedSchemas.signupStep2
    case 3:
      return combinedSchemas.signupStep3
    default:
      return null
  }
}

// 에러 처리 유틸리티 함수
const handleError = (err) => {
  if (err.name === 'ValidationError') {
    formState.value.errors = {}
    err.inner.forEach((e) => {
      formState.value.errors[e.path] = e.message
    })
  } else if (err.response?.data) {
    // 특정 에러 메시지 확인
    const errorMessage = Object.values(err.response.data).flat().join(' ')
    formState.value.modal.text = errorMessage
  } else {
    formState.value.modal.text = err.response?.data?.detail || err.message
  }
}

// 타이머 관리
let resendInterval = null
const startResendTimer = () => {
  formState.value.verification.resendTimer = 60
  formState.value.verification.resendDisabled = true
  clearInterval(resendInterval)
  resendInterval = setInterval(() => {
    formState.value.verification.resendTimer--
    if (formState.value.verification.resendTimer <= 0) {
      formState.value.verification.resendDisabled = false
      clearInterval(resendInterval)
    }
  }, 1000)
}

// API 호출 함수들
const registerUser = async () => {
  try {
    formState.value.loading.submit = true
    clearErrors()

    // 지침에 따른 검증 - 1단계는 signupStep1 스키마 사용
    const stepSchema = combinedSchemas.signupStep1
    const { validate: stepValidate } = useValidation(stepSchema)
    const isValid = await stepValidate(formState.value.form)
    if (!isValid) {
      console.log('❌ [MultiStepSignup] 1단계 검증 실패')
      return
    }

    const res = await authAPI.register({
      email: formState.value.form.email,
      password: formState.value.form.password,
    })

    if (res.uuid) {
      formState.value.verification.uuid = res.uuid
      formState.value.modal.text = '이메일로 인증 링크가 발송되었습니다. 메일함을 확인해주세요.'
      nextStep()
      startResendTimer()
    }
  } catch (err) {
    handleError(err)
  } finally {
    formState.value.loading.submit = false
  }
}

const checkEmailVerified = async () => {
  if (!formState.value.verification.uuid) {
    formState.value.modal.text = '인증 UUID가 없습니다. 다시 시도해주세요.'
    return
  }
  try {
    formState.value.loading.check = true
    const res = await authAPI.verifyEmail({
      uuid: formState.value.verification.uuid,
    })
    if (res.detail?.includes('완료')) {
      formState.value.verification.verified = true
      formState.value.modal.text = '이메일 인증이 완료되었습니다! 다음 단계로 진행할 수 있습니다.'
    } else {
      formState.value.modal.text = '아직 이메일 인증이 완료되지 않았습니다. 메일함을 확인해주세요.'
      formState.value.verification.verified = false
    }
  } catch (err) {
    formState.value.verification.verified = false
    handleError(err)
  } finally {
    formState.value.loading.check = false
  }
}

const resendEmail = async () => {
  if (!formState.value.form.email) {
    formState.value.modal.text = '이메일 주소가 필요합니다.'
    return
  }
  try {
    formState.value.loading.resend = true
    await authAPI.resendEmail({ email: formState.value.form.email })
    formState.value.modal.text = '인증 이메일이 재발송되었습니다.'
    startResendTimer()
    console.log('✅ [MultiStepSignup] 이메일 재발송 성공')
  } catch (err) {
    console.error('❌ [MultiStepSignup] 이메일 재발송 실패:', err)
    handleError(err)
  } finally {
    formState.value.loading.resend = false
  }
}

const completeRegistration = async () => {
  try {
    formState.value.loading.submit = true
    clearErrors()

    // 지침에 따른 검증 - 3단계는 signupStep3 스키마 사용
    const stepSchema = combinedSchemas.signupStep3
    const { validate: stepValidate } = useValidation(stepSchema)
    const isValid = await stepValidate(formState.value.form)
    if (!isValid) {
      console.log('❌ [MultiStepSignup] 3단계 검증 실패')
      return
    }

    await authAPI.completeRegistration({
      uuid: formState.value.verification.uuid,
      ...formState.value.form,
    })

    nextStep() // 4단계로 이동
    formState.value.loading.redirect = true
    formState.value.modal.text = '회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.'

    setTimeout(() => {
      router.push('/login')
    }, 2000)

    console.log('✅ [MultiStepSignup] 회원가입 완료')
  } catch (err) {
    console.error('❌ [MultiStepSignup] 회원가입 완료 실패:', err)
    handleError(err)
  } finally {
    formState.value.loading.submit = false
  }
}

const checkNicknameAvailability = async () => {
  if (!formState.value.form.username) {
    formState.value.nicknameCheckMessage = '닉네임을 입력해주세요.'
    formState.value.isNicknameAvailable = null
    return
  }
  try {
    formState.value.loading.nicknameCheck = true

    // 지침에 따른 API 호출
    const res = await authAPI.checkNickname({
      username: formState.value.form.username,
    })

    if (res.available) {
      formState.value.nicknameCheckMessage = '사용 가능한 닉네임입니다.'
      formState.value.isNicknameAvailable = true
      console.log('✅ [MultiStepSignup] 닉네임 사용 가능:', formState.value.form.username)
    } else {
      formState.value.nicknameCheckMessage = '이미 사용 중인 닉네임입니다.'
      formState.value.isNicknameAvailable = false
      console.log('ℹ️ [MultiStepSignup] 닉네임 중복:', formState.value.form.username)
    }
  } catch (err) {
    console.error('❌ [MultiStepSignup] 닉네임 중복 확인 실패:', err)
    handleError(err)
    formState.value.nicknameCheckMessage = '닉네임 중복 확인 중 오류가 발생했습니다.'
    formState.value.isNicknameAvailable = false
  } finally {
    formState.value.loading.nicknameCheck = false
  }
}

const resetNicknameCheck = () => {
  formState.value.nicknameCheckMessage = ''
  formState.value.isNicknameAvailable = null
}

// 모달 닫기 핸들러
const handleModalClose = () => {
  const modalText = formState.value.modal.text
  formState.value.modal.text = '' // 먼저 모달 닫기

  // 특정 에러 메시지인 경우 회원가입 초기화
  if (modalText === '해당 이메일로 대기 중인 인증이 없습니다.') {
    currentStep.value = 0 // 첫 번째 스텝으로 이동
    // 폼 상태 및 검증 상태 초기화
    formState.value.form = {
      email: '',
      password: '',
      passwordConfirm: '',
      username: '',
      first_name: '',
      last_name: '',
      gender: '',
      weekly_read_time: null,
      yearly_read_count: null,
      category_ids: [],
    }
    formState.value.errors = {}
    formState.value.verification = {
      uuid: '',
      verified: false,
      resendDisabled: false,
      resendTimer: 60,
    }
    // 비밀번호 유효성 메시지 초기화
    passwordValidationMessages.value = [
      { text: '8자 이상', valid: false },
      { text: '대문자 포함', valid: false },
      { text: '소문자 포함', valid: false },
      { text: '숫자 포함', valid: false },
      { text: '특수문자 포함', valid: false },
    ]
    passwordMatchMessage.value = '비밀번호를 입력해주세요'
    isPasswordMatch.value = false
  }
}

// 단계별 처리 함수
const handleNext = async () => {
  clearErrors()

  switch (currentStep.value) {
    case 0:
      await registerUser()
      break
    case 1:
      if (!formState.value.verification.verified) {
        formState.value.modal.text = '이메일 인증을 완료해 주세요.'
        return
      }
      nextStep()
      break
    case 2:
      try {
        formState.value.loading.submit = true

        // 지침에 따른 검증 - 2단계는 signupStep2 스키마 사용
        const stepSchema = combinedSchemas.signupStep2
        const { validate: stepValidate } = useValidation(stepSchema)
        const isValid = await stepValidate(formState.value.form)
        if (!isValid) {
          console.log('❌ [MultiStepSignup] 2단계 검증 실패')
          return
        }

        nextStep()
      } catch (err) {
        handleError(err)
      } finally {
        formState.value.loading.submit = false
      }
      break
    case 3:
      await completeRegistration()
      break
  }
}

// 카테고리 관련 함수
const toggleCategory = (categoryId) => {
  const index = formState.value.form.category_ids.indexOf(categoryId)
  if (index === -1) {
    formState.value.form.category_ids.push(categoryId)
  } else {
    formState.value.form.category_ids.splice(index, 1)
  }
}

const fetchCategories = async () => {
  try {
    const res = await authAPI.getCategories()
    formState.value.categories = res
    console.log('✅ [MultiStepSignup] 카테고리 목록 로드 완료:', res.length)
  } catch (err) {
    console.error('❌ [MultiStepSignup] 카테고리 목록 로드 실패:', err)
    handleError(err)
  }
}

// 컴포넌트 마운트 시 실행
onMounted(async () => {
  fetchCategories()
  // Check for UUID in URL and initiate verification if present
  const urlParams = new URLSearchParams(window.location.search)
  const uuid = urlParams.get('uuid')
  if (uuid && (currentStep.value === 0 || currentStep.value === 1)) {
    formState.value.verification.uuid = uuid // Store the UUID
    // Instead of calling checkEmailVerified, send a GET request to the verification endpoint
    try {
      formState.value.loading.check = true
      const res = await authAPI.verifyEmailByUUID(uuid) // Send GET request
      if (res.detail) {
        formState.value.verification.verified = true
        formState.value.modal.text = res.detail || '이메일 인증이 완료되었습니다!'
        currentStep.value = 1 // Move to verification step if needed
      } else {
        // Handle other status codes if necessary
        formState.value.modal.text = res?.detail || '이메일 인증 중 오류가 발생했습니다.'
      }
    } catch (err) {
      // Handle errors from the GET request
      formState.value.verification.verified = false
      handleError(err)
    } finally {
      formState.value.loading.check = false
    }
  }
})

const passwordValidationMessages = ref([
  { text: '8자 이상', valid: false },
  { text: '대문자 포함', valid: false },
  { text: '소문자 포함', valid: false },
  { text: '숫자 포함', valid: false },
  { text: '특수문자 포함', valid: false },
])
const passwordMatchMessage = ref('비밀번호를 입력해주세요')
const isPasswordMatch = ref(false)

// 디바운스 유틸리티 함수
const debounce = (fn, delay) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

// 비밀번호 유효성 검사 함수
const validatePassword = debounce(() => {
  const password = formState.value.form.password
  passwordValidationMessages.value = [
    { text: '8자 이상', valid: password.length >= 8 },
    { text: '대문자 포함', valid: /[A-Z]/.test(password) },
    { text: '소문자 포함', valid: /[a-z]/.test(password) },
    { text: '숫자 포함', valid: /[0-9]/.test(password) },
    { text: '특수문자 포함', valid: /[!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]/.test(password) },
  ]
}, 300)

// 비밀번호 일치 검사 함수
const checkPasswordMatch = debounce(() => {
  const password = formState.value.form.password
  const confirmPassword = formState.value.form.passwordConfirm

  if (!confirmPassword) {
    isPasswordMatch.value = false
    return
  }

  if (password === confirmPassword) {
    passwordMatchMessage.value = '비밀번호가 일치합니다'
    isPasswordMatch.value = true
  } else {
    passwordMatchMessage.value = '비밀번호가 일치하지 않습니다'
    isPasswordMatch.value = false
  }
}, 300)

// 비밀번호 변경 감시
watch(
  () => formState.value.form.password,
  () => {
    validatePassword()
    if (formState.value.form.passwordConfirm) {
      checkPasswordMatch()
    }
  },
)

// 비밀번호 확인 변경 감시
watch(
  () => formState.value.form.passwordConfirm,
  () => {
    if (formState.value.form.password) {
      checkPasswordMatch()
    }
  },
)
</script>

<style scoped>
.signup-container {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2.5rem;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.step-progress {
  display: flex;
  justify-content: space-between;
  margin-bottom: 3rem;
  position: relative;
  padding: 0 1rem;
}

.step-progress::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  background: #e2e8f0;
  z-index: 1;
}

.step {
  flex: 1;
  text-align: center;
  padding: 0.75rem 0;
  position: relative;
  z-index: 2;
  background: #fff;
  color: #94a3b8;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.step.active {
  color: #42b983;
  font-weight: 600;
}

.form-group {
  margin-bottom: 1.75rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.75rem;
  color: #1e293b;
  font-weight: 600;
  font-size: 0.95rem;
}

.form-control,
.btn {
  box-sizing: border-box;
}

.form-control {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background-color: #f8fafc;
}

.form-control:focus {
  border-color: #42b983;
  outline: none;
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.1);
  background-color: #fff;
}

.error {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  display: block;
  font-weight: 500;
}

.password-validation {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  min-height: 120px;
  padding: 0.5rem;
  background-color: #f8fafc;
  border-radius: 8px;
}

.password-validation p {
  color: #ef4444;
  margin: 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.password-validation p::before {
  content: '•';
  font-size: 1.2rem;
}

.password-validation p.valid {
  color: #42b983;
}

.password-match-container {
  min-height: 24px;
  margin-top: 0.75rem;
  padding: 0.5rem;
  background-color: #f8fafc;
  border-radius: 8px;
}

.password-match {
  display: block;
  font-size: 0.875rem;
  color: #ef4444;
  font-weight: 500;
}

.password-match.match {
  color: #42b983;
}

.btn {
  padding: 0.875rem 1.75rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  width: 100%;
  margin-top: 1rem;
}

.btn:disabled {
  cursor: not-allowed;
  background: #e2e8f0;
  color: #a0aec0;
  transform: none;
  box-shadow: none;
}

.btn:disabled:hover {
  transform: none;
  box-shadow: none;
}

.btn-primary {
  background: #42b983;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #3aa876;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(66, 185, 131, 0.2);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: none;
}

.verification-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  background: #f8fafc;
  border-radius: 12px;
  text-align: center;
}

.verification-loading p {
  margin-top: 1rem;
  color: #475569;
  font-size: 1.1rem;
}

.verification-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 2rem;
  background: #f8fafc;
  border-radius: 12px;
  text-align: center;
}

.verification-icon {
  width: 80px;
  height: 80px;
  margin-bottom: 2rem;
  color: #42b983;
  animation: float 3s ease-in-out infinite;
}

.verification-content {
  width: 100%;
  max-width: 400px;
}

.verification-content h3 {
  color: #1e293b;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.verification-message {
  font-size: 1.1rem;
  color: #475569;
  margin-bottom: 2rem;
  line-height: 1.8;
}

.email-highlight {
  color: #42b983;
  font-weight: 600;
  background: rgba(66, 185, 131, 0.1);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.verification-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1.5rem;
}

.verification-actions .btn {
  width: 100%;
  max-width: 300px;
}

.resend-timer {
  color: #64748b;
  font-size: 0.9rem;
  margin: 0.5rem 0;
}

.verification-success {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #42b983;
  color: white;
  border-radius: 8px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(66, 185, 131, 0.2);
  animation: slideUp 0.3s ease-out;
}

.verification-success svg {
  width: 20px;
  height: 20px;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.completion-container {
  text-align: center;
  padding: 3rem 2rem;
  background: #f8fafc;
  border-radius: 12px;
}

.completion-icon {
  width: 88px;
  height: 88px;
  margin: 0 auto 2rem;
  color: #42b983;
}

.completion-message {
  font-size: 1.25rem;
  color: #42b983;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.redirect-loader {
  margin-top: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #42b983;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

.spinner-small {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #1a73e8;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.resend-timer {
  color: #666;
  font-size: 0.9rem;
}

.loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.loader p {
  margin-top: 1rem;
  color: #666;
}

.reading-info,
.categories {
  margin-bottom: 2rem;
}

.input-group {
  margin-bottom: 1rem;
}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
  margin-top: 1.25rem;
}

.category-item {
  padding: 0.875rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  background: #fff;
}

.category-item:hover {
  border-color: #42b983;
  background-color: #f0fdf4;
  transform: translateY(-1px);
}

.category-item.selected {
  background-color: #42b983;
  color: white;
  border-color: #42b983;
  box-shadow: 0 2px 8px rgba(66, 185, 131, 0.2);
}

.reading-info h3,
.categories h3 {
  color: #1e293b;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1.25rem;
}

.reading-info label {
  display: block;
  margin-bottom: 0.75rem;
  color: #475569;
  font-weight: 500;
}

.input-with-button {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  width: 100%;
}

.input-with-button .form-control {
  flex-grow: 1;
  flex-basis: 60%;
}

.check-button {
  flex-shrink: 0;
  flex-basis: 40%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
  margin-top: -2px;
}

.nickname-check-message-container {
  min-height: 1.5rem;
  margin-top: 0.5rem;
}

.nickname-check-message {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.4;
}

.nickname-check-message.available {
  color: #42b983;
}

.nickname-check-message.not-available {
  color: #ef4444;
}

.name-group {
  display: block;
  width: 100%;
}

.name-group .form-group {
  margin-bottom: 1.5rem;
  width: 100%;
}

.form-group:not(.name-group) {
  margin-bottom: 1.75rem;
}

.form-group:has(select#gender) {
  margin-top: 1.75rem;
}

.form-group label + .input-with-button,
.form-group label + .form-control,
.name-group .form-group label + .form-control {
  margin-top: 0;
}

/* Added styles for select element */
.form-group select.form-control {
  appearance: none; /* Remove default browser styles */
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1em auto;
  padding-right: 2.5rem; /* Make space for the custom arrow */
}

.signup-container form > div {
  padding-bottom: 1.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
}

.signup-container form > div:last-of-type {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.actions {
  margin-top: 2rem;
}

.spinner,
.spinner-small {
  flex-shrink: 0;
}

.spinner-small {
  margin-right: 0.5rem;
}

@media (max-width: 600px) {
  .name-group .form-group {
    margin-bottom: 1.5rem;
  }

  .form-group:has(select#gender) {
    margin-top: 1.5rem;
  }
}
</style>
