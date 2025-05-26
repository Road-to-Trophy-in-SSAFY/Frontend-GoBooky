/**
 * API 에러 메시지를 한국어로 변환하는 유틸리티
 */

// 영어 에러 메시지를 한국어로 매핑하는 객체
const errorMessageMap = {
  // 필수 필드 관련
  'This field is required.': '필수 정보를 입력해주세요.',
  'This field may not be blank.': '필수 정보를 입력해주세요.',
  'This field cannot be empty.': '필수 정보를 입력해주세요.',

  // 비밀번호 관련
  'Password is required.': '비밀번호를 입력해주세요.',
  'Invalid password.': '비밀번호가 일치하지 않습니다.',
  'Incorrect password.': '비밀번호가 일치하지 않습니다.',

  // 인증 관련
  'Authentication credentials were not provided.': '로그인이 필요합니다.',
  'Invalid token.': '인증이 만료되었습니다. 다시 로그인해주세요.',
  'Token has expired.': '인증이 만료되었습니다. 다시 로그인해주세요.',
  'Invalid authentication credentials.': '인증 정보가 올바르지 않습니다.',

  // 권한 관련
  'You do not have permission to perform this action.': '이 작업을 수행할 권한이 없습니다.',
  'Permission denied.': '권한이 없습니다.',

  // 네트워크 관련
  'Network Error': '네트워크 연결을 확인해주세요.',
  'Request timeout': '요청 시간이 초과되었습니다. 다시 시도해주세요.',

  // 서버 관련
  'Internal Server Error': '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  'Service Unavailable': '서비스를 일시적으로 사용할 수 없습니다.',
}

/**
 * 영어 에러 메시지를 한국어로 변환
 * @param {string} message - 원본 에러 메시지
 * @returns {string} 한국어로 변환된 메시지
 */
export function translateErrorMessage(message) {
  if (!message || typeof message !== 'string') {
    return '오류가 발생했습니다.'
  }

  // 정확히 일치하는 메시지 찾기
  if (errorMessageMap[message]) {
    return errorMessageMap[message]
  }

  // 부분 일치하는 메시지 찾기
  for (const [englishMsg, koreanMsg] of Object.entries(errorMessageMap)) {
    if (message.includes(englishMsg.replace('.', ''))) {
      return koreanMsg
    }
  }

  // 키워드 기반 매칭
  const lowerMessage = message.toLowerCase()

  if (
    lowerMessage.includes('required') ||
    lowerMessage.includes('blank') ||
    lowerMessage.includes('empty')
  ) {
    return '필수 정보를 입력해주세요.'
  }

  if (
    lowerMessage.includes('password') &&
    (lowerMessage.includes('incorrect') || lowerMessage.includes('invalid'))
  ) {
    return '비밀번호가 일치하지 않습니다.'
  }

  if (lowerMessage.includes('authentication') || lowerMessage.includes('credentials')) {
    return '인증에 실패했습니다.'
  }

  if (lowerMessage.includes('permission') || lowerMessage.includes('forbidden')) {
    return '권한이 없습니다.'
  }

  if (lowerMessage.includes('network') || lowerMessage.includes('connection')) {
    return '네트워크 연결을 확인해주세요.'
  }

  if (lowerMessage.includes('timeout')) {
    return '요청 시간이 초과되었습니다. 다시 시도해주세요.'
  }

  if (lowerMessage.includes('server error') || lowerMessage.includes('internal error')) {
    return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
  }

  // 이미 한국어인 경우 그대로 반환
  if (/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(message)) {
    return message
  }

  // 변환할 수 없는 경우 기본 메시지
  return '오류가 발생했습니다.'
}

/**
 * API 에러 응답에서 적절한 한국어 에러 메시지 추출
 * @param {Object} error - Axios 에러 객체
 * @param {string} defaultMessage - 기본 메시지
 * @returns {string} 한국어 에러 메시지
 */
export function getKoreanErrorMessage(error, defaultMessage = '오류가 발생했습니다.') {
  if (!error) {
    return defaultMessage
  }

  // 네트워크 에러
  if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
    return '네트워크 연결을 확인해주세요.'
  }

  // 타임아웃 에러
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return '요청 시간이 초과되었습니다. 다시 시도해주세요.'
  }

  // 응답이 없는 경우
  if (!error.response?.data) {
    return translateErrorMessage(error.message) || defaultMessage
  }

  const data = error.response.data

  // 특정 필드 에러 처리 (비밀번호, 이메일 등)
  const fieldErrors = ['password', 'email', 'username', 'first_name', 'last_name']
  for (const field of fieldErrors) {
    if (data[field]) {
      const fieldError = Array.isArray(data[field]) ? data[field][0] : data[field]
      return translateErrorMessage(fieldError)
    }
  }

  // detail 메시지 처리
  if (data.detail) {
    return translateErrorMessage(data.detail)
  }

  // 기타 필드 에러들
  const errorFields = Object.keys(data)
  if (errorFields.length > 0) {
    const firstField = errorFields[0]
    const firstError = Array.isArray(data[firstField]) ? data[firstField][0] : data[firstField]
    return translateErrorMessage(firstError)
  }

  return defaultMessage
}

/**
 * 회원탈퇴 관련 특화된 에러 메시지 처리
 * @param {Object} error - Axios 에러 객체
 * @returns {string} 한국어 에러 메시지
 */
export function getDeleteAccountErrorMessage(error) {
  const message = getKoreanErrorMessage(error, '회원탈퇴 중 오류가 발생했습니다.')

  // 회원탈퇴 특화 메시지 처리
  if (error.response?.status === 401) {
    return '로그인이 필요합니다.'
  }

  if (error.response?.status === 403) {
    return '계정 삭제 권한이 없습니다.'
  }

  if (error.response?.status === 404) {
    return '계정을 찾을 수 없습니다.'
  }

  return message
}
