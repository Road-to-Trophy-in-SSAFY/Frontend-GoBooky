import { ref } from 'vue'

/**
 * 지침에 따른 Toast 관리 Composable
 * - 전역 오류 처리를 위한 Toast 시스템
 * - 4xx/5xx 오류 카테고리화
 * - 일관된 UX 제공
 * - 단순한 상태 관리 (Vue 베스트 프랙티스 준수)
 */

// 전역 Toast 컨테이너 (단일 소스-오브-트루스)
const toasts = ref([])
const toastTimers = new Map() // 타이머 관리용
let toastId = 0

/**
 * Toast 추가 함수
 * @param {string} message 메시지
 * @param {string} type 타입 (success, error, info, warning)
 * @param {number} duration 지속 시간 (ms)
 * @returns {number} Toast ID
 */
const addToast = (message, type = 'info', duration = 4000) => {
  const id = ++toastId
  const toast = {
    id,
    message,
    type,
    visible: true,
  }

  // UX 개선: 최대 토스트 개수 제한 (3개)
  const MAX_TOASTS = 3
  if (toasts.value.length >= MAX_TOASTS) {
    // 가장 오래된 토스트 제거
    const oldestToast = toasts.value[0]
    removeToast(oldestToast.id)
  }

  toasts.value.push(toast)

  // 자동으로 제거 (UX 베스트 프랙티스: 4초)
  const timerId = setTimeout(() => {
    removeToast(id)
  }, duration)

  // 타이머 저장 (호버 시 일시정지용)
  toastTimers.set(id, {
    timerId,
    remainingTime: duration,
    startTime: Date.now(),
  })

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

  // 타이머 정리
  const timer = toastTimers.get(id)
  if (timer) {
    clearTimeout(timer.timerId)
    toastTimers.delete(id)
  }
}

/**
 * 모든 Toast 제거
 */
const clearAllToasts = () => {
  // 모든 타이머 정리
  toastTimers.forEach((timer) => {
    clearTimeout(timer.timerId)
  })
  toastTimers.clear()
  toasts.value = []
}

/**
 * Toast 일시정지 (호버 시)
 * @param {number} id Toast ID
 */
const pauseToast = (id) => {
  const timer = toastTimers.get(id)
  if (timer) {
    clearTimeout(timer.timerId)
    const elapsed = Date.now() - timer.startTime
    timer.remainingTime = Math.max(0, timer.remainingTime - elapsed)
  }
}

/**
 * Toast 재개 (호버 해제 시)
 * @param {number} id Toast ID
 */
const resumeToast = (id) => {
  const timer = toastTimers.get(id)
  if (timer && timer.remainingTime > 0) {
    timer.startTime = Date.now()
    timer.timerId = setTimeout(() => {
      removeToast(id)
    }, timer.remainingTime)
  }
}

/**
 * useToast Composable (싱글톤 패턴)
 */
export function useToast() {
  const success = (message, duration) => addToast(message, 'success', duration)
  const error = (message, duration) => addToast(message, 'error', duration)
  const info = (message, duration) => addToast(message, 'info', duration)
  const warning = (message, duration) => addToast(message, 'warning', duration)

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    pauseToast,
    resumeToast,
    success,
    error,
    info,
    warning,
  }
}

/**
 * 전역 Toast 인스턴스 (싱글톤)
 */
export const toast = useToast()
