import { ref, computed } from 'vue'
import * as yup from 'yup'

/**
 * 지침에 따른 폼 검증 Composable
 * - 공통 검증 로직 캡슐화
 * - 재사용 가능한 검증 스키마
 * - 에러 상태 관리
 */
export function useValidation(schema) {
  const errors = ref({})
  const isValidating = ref(false)

  /**
   * 에러 초기화
   */
  const clearErrors = () => {
    errors.value = {}
  }

  /**
   * 특정 필드 에러 초기화
   * @param {string} field 필드명
   */
  const clearFieldError = (field) => {
    if (errors.value[field]) {
      delete errors.value[field]
    }
  }

  /**
   * 폼 데이터 검증
   * @param {Object} data 검증할 데이터
   * @param {Object} options 검증 옵션
   * @returns {Promise<boolean>} 검증 성공 여부
   */
  const validate = async (data, options = {}) => {
    const { abortEarly = false } = options

    isValidating.value = true
    clearErrors()

    try {
      await schema.validate(data, { abortEarly })
      console.log('✅ [useValidation] 검증 성공')
      return true
    } catch (err) {
      console.log('❌ [useValidation] 검증 실패:', err)

      if (err.name === 'ValidationError') {
        if (abortEarly) {
          errors.value[err.path] = err.message
        } else {
          err.inner.forEach((e) => {
            errors.value[e.path] = e.message
          })
        }
      }
      return false
    } finally {
      isValidating.value = false
    }
  }

  /**
   * 특정 필드만 검증
   * @param {string} field 필드명
   * @param {any} value 검증할 값
   * @returns {Promise<boolean>} 검증 성공 여부
   */
  const validateField = async (field, value) => {
    try {
      await schema.validateAt(field, { [field]: value })
      clearFieldError(field)
      return true
    } catch (err) {
      errors.value[field] = err.message
      return false
    }
  }

  /**
   * 실시간 검증 (디바운스 적용)
   * @param {string} field 필드명
   * @param {any} value 검증할 값
   * @param {number} delay 디바운스 지연시간 (ms)
   */
  const validateFieldDebounced = (() => {
    const timeouts = new Map()

    return (field, value, delay = 300) => {
      // 기존 타이머 클리어
      if (timeouts.has(field)) {
        clearTimeout(timeouts.get(field))
      }

      // 새 타이머 설정
      const timeoutId = setTimeout(() => {
        validateField(field, value)
        timeouts.delete(field)
      }, delay)

      timeouts.set(field, timeoutId)
    }
  })()

  // 계산된 속성
  const hasErrors = computed(() => Object.keys(errors.value).length > 0)
  const isValid = computed(() => !hasErrors.value && !isValidating.value)

  return {
    // 상태
    errors,
    isValidating,
    hasErrors,
    isValid,

    // 메서드
    validate,
    validateField,
    validateFieldDebounced,
    clearErrors,
    clearFieldError,
  }
}

/**
 * 공통 검증 스키마들
 */
export const validationSchemas = {
  // 이메일 검증
  email: yup.string().email('이메일 형식이 올바르지 않습니다.').required('이메일을 입력해주세요.'),

  // 비밀번호 검증 (회원가입용)
  password: yup
    .string()
    .min(8, '비밀번호는 8자 이상이어야 합니다.')
    .max(32, '비밀번호는 32자 이하여야 합니다.')
    .matches(/[a-z]/, '소문자를 포함해야 합니다.')
    .matches(/[A-Z]/, '대문자를 포함해야 합니다.')
    .matches(/[0-9]/, '숫자를 포함해야 합니다.')
    .matches(/[!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]/, '특수문자를 포함해야 합니다.')
    .required('비밀번호를 입력해주세요.'),

  // 비밀번호 검증 (로그인용)
  passwordLogin: yup.string().required('비밀번호를 입력해주세요.'),

  // 닉네임 검증
  username: yup
    .string()
    .min(2, '닉네임은 2자 이상이어야 합니다.')
    .max(20, '닉네임은 20자 이하여야 합니다.')
    .matches(/^[가-힣a-zA-Z0-9_]+$/, '닉네임은 한글, 영문, 숫자, 언더스코어만 사용 가능합니다.')
    .required('닉네임을 입력해주세요.'),

  // 이름 검증
  name: yup
    .string()
    .min(1, '이름은 1자 이상이어야 합니다.')
    .max(20, '이름은 20자 이하여야 합니다.')
    .matches(/^[가-힣a-zA-Z\s]+$/, '이름은 한글 또는 영문만 사용 가능합니다.')
    .required('이름을 입력해주세요.'),

  // 성별 검증
  gender: yup
    .string()
    .oneOf(['male', 'female'], '성별을 선택해주세요.')
    .required('성별을 선택해주세요.'),

  // 숫자 검증 (독서 시간/권수)
  positiveNumber: yup
    .number()
    .min(0, '0 이상의 숫자를 입력해주세요.')
    .nullable()
    .transform((value, originalValue) => {
      return originalValue === '' ? null : value
    }),

  // 카테고리 검증
  categories: yup
    .array()
    .min(1, '최소 1개 이상의 카테고리를 선택해주세요.')
    .required('카테고리를 선택해주세요.'),

  // 쓰레드 제목 검증
  threadTitle: yup
    .string()
    .min(2, '제목은 2자 이상이어야 합니다.')
    .max(100, '제목은 100자 이하여야 합니다.')
    .required('제목을 입력해주세요.'),

  // 쓰레드 내용 검증
  threadContent: yup
    .string()
    .min(10, '내용은 10자 이상이어야 합니다.')
    .max(5000, '내용은 5000자 이하여야 합니다.')
    .required('내용을 입력해주세요.'),

  // 날짜 검증
  date: yup
    .date()
    .max(new Date(), '미래 날짜는 선택할 수 없습니다.')
    .required('날짜를 선택해주세요.'),
}

/**
 * 조합된 검증 스키마들
 */
export const combinedSchemas = {
  // 로그인 폼
  login: yup.object({
    email: validationSchemas.email,
    password: validationSchemas.passwordLogin,
  }),

  // 회원가입 1단계 (이메일, 비밀번호)
  signupStep1: yup.object({
    email: validationSchemas.email,
    password: validationSchemas.password,
    passwordConfirm: yup
      .string()
      .oneOf([yup.ref('password')], '비밀번호가 일치하지 않습니다.')
      .required('비밀번호 확인을 입력해주세요.'),
  }),

  // 회원가입 2단계 (기본 정보)
  signupStep2: yup.object({
    username: validationSchemas.username,
    first_name: validationSchemas.name,
    last_name: validationSchemas.name,
    gender: validationSchemas.gender,
  }),

  // 회원가입 3단계 (독서 정보)
  signupStep3: yup.object({
    weekly_read_time: validationSchemas.positiveNumber,
    yearly_read_count: validationSchemas.positiveNumber,
    category_ids: validationSchemas.categories,
  }),

  // 쓰레드 생성/수정
  thread: yup.object({
    title: validationSchemas.threadTitle,
    content: validationSchemas.threadContent,
    reading_date: validationSchemas.date,
    book: yup.number().required('도서를 선택해주세요.'),
  }),
}

/**
 * 비밀번호 강도 체크 유틸리티
 * @param {string} password 비밀번호
 * @returns {Array} 검증 메시지 배열
 */
export function getPasswordValidationMessages(password) {
  const checks = [
    {
      test: (pwd) => pwd.length >= 8,
      text: '8자 이상',
      valid: false,
    },
    {
      test: (pwd) => pwd.length <= 32,
      text: '32자 이하',
      valid: false,
    },
    {
      test: (pwd) => /[a-z]/.test(pwd),
      text: '소문자 포함',
      valid: false,
    },
    {
      test: (pwd) => /[A-Z]/.test(pwd),
      text: '대문자 포함',
      valid: false,
    },
    {
      test: (pwd) => /[0-9]/.test(pwd),
      text: '숫자 포함',
      valid: false,
    },
    {
      test: (pwd) => /[!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]/.test(pwd),
      text: '특수문자 포함',
      valid: false,
    },
  ]

  return checks.map((check) => ({
    ...check,
    valid: check.test(password || ''),
  }))
}
