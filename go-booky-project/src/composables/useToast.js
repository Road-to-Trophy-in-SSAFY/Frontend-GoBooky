import { ref, createApp } from 'vue'
import Toast from '@/components/ui/Toast.vue'
import { getKoreanErrorMessage } from '@/utils/errorMessages'

/**
 * 지침에 따른 Toast 관리 Composable
 * - 전역 오류 처리를 위한 Toast 시스템
 * - 4xx/5xx 오류 카테고리화
 * - 일관된 UX 제공
 */

// 전역 Toast 컨테이너
const toasts = ref([])
let toastId = 0

/**
 * Toast 표시 함수
 * @param {Object} options Toast 옵션
 */
const showToast = (options) => {
  const id = ++toastId
  const toast = {
    id,
    ...options,
    visible: true,
  }

  toasts.value.push(toast)

  // DOM에 Toast 컴포넌트 마운트
  const container = document.createElement('div')
  container.id = `toast-${id}`
  document.body.appendChild(container)

  const app = createApp(Toast, {
    ...options,
    onClose: () => removeToast(id),
  })

  app.mount(container)

  return id
}

/**
 * Toast 제거 함수
 * @param {number} id Toast ID
 */
const removeToast = (id) => {
  const index = toasts.value.findIndex((toast) => toast.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }

  // DOM에서 제거
  const container = document.getElementById(`toast-${id}`)
  if (container) {
    container.remove()
  }
}

/**
 * 모든 Toast 제거
 */
const clearAllToasts = () => {
  toasts.value.forEach((toast) => {
    const container = document.getElementById(`toast-${toast.id}`)
    if (container) {
      container.remove()
    }
  })
  toasts.value = []
}

/**
 * useToast Composable
 */
export function useToast() {
  /**
   * 성공 Toast 표시
   * @param {string} message 메시지
   * @param {Object} options 추가 옵션
   */
  const success = (message, options = {}) => {
    return showToast({
      type: 'success',
      message,
      title: '성공',
      ...options,
    })
  }

  /**
   * 오류 Toast 표시
   * @param {string} message 메시지
   * @param {Object} options 추가 옵션
   */
  const error = (message, options = {}) => {
    return showToast({
      type: 'error',
      message,
      title: '오류',
      duration: 7000, // 오류는 조금 더 오래 표시
      ...options,
    })
  }

  /**
   * 경고 Toast 표시
   * @param {string} message 메시지
   * @param {Object} options 추가 옵션
   */
  const warning = (message, options = {}) => {
    return showToast({
      type: 'warning',
      message,
      title: '경고',
      ...options,
    })
  }

  /**
   * 정보 Toast 표시
   * @param {string} message 메시지
   * @param {Object} options 추가 옵션
   */
  const info = (message, options = {}) => {
    return showToast({
      type: 'info',
      message,
      title: '알림',
      ...options,
    })
  }

  /**
   * API 오류를 Toast로 표시 (지침에 따른 4xx/5xx 카테고리화)
   * @param {Object} err Axios 오류 객체
   * @param {string} defaultMessage 기본 메시지
   */
  const showApiError = (err, defaultMessage = '요청 처리 중 오류가 발생했습니다.') => {
    console.error('🚨 [useToast] API 오류:', err)

    const status = err.response?.status
    let title = '오류'
    let type = 'error'
    let duration = 7000

    // 지침에 따른 4xx/5xx 카테고리화
    if (status >= 400 && status < 500) {
      // 4xx: 클라이언트 오류
      if (status === 401) {
        title = '인증 필요'
        type = 'warning'
      } else if (status === 403) {
        title = '권한 없음'
        type = 'warning'
      } else if (status === 404) {
        title = '찾을 수 없음'
        type = 'warning'
      } else if (status === 422) {
        title = '입력 오류'
        type = 'warning'
      } else {
        title = '요청 오류'
        type = 'warning'
      }
    } else if (status >= 500) {
      // 5xx: 서버 오류
      title = '서버 오류'
      type = 'error'
      duration = 10000 // 서버 오류는 더 오래 표시
    }

    // 한국어 오류 메시지 추출
    const message = getKoreanErrorMessage(err, defaultMessage)

    return showToast({
      type,
      title,
      message,
      duration,
      persistent: status >= 500, // 서버 오류는 수동으로 닫아야 함
    })
  }

  /**
   * 네트워크 오류 Toast 표시
   * @param {Object} err 네트워크 오류
   */
  const showNetworkError = (err) => {
    console.error('🌐 [useToast] 네트워크 오류:', err)

    return showToast({
      type: 'error',
      title: '연결 오류',
      message: '네트워크 연결을 확인해주세요.',
      duration: 8000,
      persistent: true,
    })
  }

  /**
   * 로딩 Toast 표시 (진행 상황 표시용)
   * @param {string} message 메시지
   * @param {Object} options 추가 옵션
   */
  const loading = (message, options = {}) => {
    return showToast({
      type: 'info',
      title: '처리 중',
      message,
      persistent: true,
      dismissible: false,
      ...options,
    })
  }

  return {
    // 기본 Toast 메서드
    success,
    error,
    warning,
    info,
    loading,

    // API 오류 전용 메서드
    showApiError,
    showNetworkError,

    // 관리 메서드
    remove: removeToast,
    clear: clearAllToasts,

    // 상태
    toasts: toasts.value,
  }
}

/**
 * 전역 Toast 인스턴스 (싱글톤)
 */
export const toast = useToast()
