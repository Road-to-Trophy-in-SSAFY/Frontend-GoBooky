import { ref } from 'vue'

/**
 * 지침에 따른 API Composable
 * - API 호출 로직 캡슐화
 * - 로딩 상태 및 에러 처리
 * - 재사용 가능한 API 패턴
 */
export function useApi() {
  const isLoading = ref(false)
  const error = ref(null)
  const data = ref(null)

  /**
   * 에러 초기화
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * 데이터 초기화
   */
  const clearData = () => {
    data.value = null
  }

  /**
   * 상태 초기화
   */
  const reset = () => {
    isLoading.value = false
    error.value = null
    data.value = null
  }

  /**
   * API 호출 실행
   * @param {Function} apiCall API 호출 함수
   * @param {Object} options 옵션
   * @param {boolean} options.showLoading 로딩 상태 표시 여부
   * @param {boolean} options.clearPrevious 이전 데이터 초기화 여부
   * @returns {Promise} API 응답
   */
  const execute = async (apiCall, options = {}) => {
    const { showLoading = true, clearPrevious = true } = options

    if (showLoading) {
      isLoading.value = true
    }

    if (clearPrevious) {
      error.value = null
    }

    try {
      console.log('🚀 [useApi] API 호출 시작')

      const response = await apiCall()
      data.value = response

      console.log('✅ [useApi] API 호출 성공')
      return response
    } catch (err) {
      console.error('❌ [useApi] API 호출 실패:', err)

      // 에러 메시지 설정
      if (err.response?.data?.detail) {
        error.value = err.response.data.detail
      } else if (err.response?.data?.message) {
        error.value = err.response.data.message
      } else if (err.response?.data?.error) {
        error.value = err.response.data.error
      } else if (err.message) {
        error.value = err.message
      } else {
        error.value = 'API 호출 중 오류가 발생했습니다.'
      }

      throw err
    } finally {
      if (showLoading) {
        isLoading.value = false
      }
    }
  }

  /**
   * 여러 API 호출을 병렬로 실행
   * @param {Array<Function>} apiCalls API 호출 함수 배열
   * @param {Object} options 옵션
   * @returns {Promise<Array>} API 응답 배열
   */
  const executeParallel = async (apiCalls, options = {}) => {
    const { showLoading = true } = options

    if (showLoading) {
      isLoading.value = true
    }

    error.value = null

    try {
      console.log('🚀 [useApi] 병렬 API 호출 시작:', apiCalls.length)

      const responses = await Promise.all(apiCalls.map((call) => call()))
      data.value = responses

      console.log('✅ [useApi] 병렬 API 호출 성공')
      return responses
    } catch (err) {
      console.error('❌ [useApi] 병렬 API 호출 실패:', err)

      error.value = err.message || '병렬 API 호출 중 오류가 발생했습니다.'
      throw err
    } finally {
      if (showLoading) {
        isLoading.value = false
      }
    }
  }

  /**
   * 조건부 API 호출
   * @param {Function} condition 조건 함수
   * @param {Function} apiCall API 호출 함수
   * @param {Object} options 옵션
   * @returns {Promise} API 응답 또는 null
   */
  const executeIf = async (condition, apiCall, options = {}) => {
    if (!condition()) {
      console.log('ℹ️ [useApi] 조건 불만족 - API 호출 스킵')
      return null
    }

    return execute(apiCall, options)
  }

  /**
   * 재시도 가능한 API 호출
   * @param {Function} apiCall API 호출 함수
   * @param {Object} options 옵션
   * @param {number} options.maxRetries 최대 재시도 횟수
   * @param {number} options.retryDelay 재시도 간격 (ms)
   * @returns {Promise} API 응답
   */
  const executeWithRetry = async (apiCall, options = {}) => {
    const { maxRetries = 3, retryDelay = 1000, showLoading = true } = options

    if (showLoading) {
      isLoading.value = true
    }

    error.value = null
    let lastError = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🚀 [useApi] API 호출 시도 ${attempt}/${maxRetries}`)

        const response = await apiCall()
        data.value = response

        console.log('✅ [useApi] API 호출 성공')
        return response
      } catch (err) {
        lastError = err
        console.error(`❌ [useApi] API 호출 실패 (${attempt}/${maxRetries}):`, err)

        if (attempt < maxRetries) {
          console.log(`⏳ [useApi] ${retryDelay}ms 후 재시도...`)
          await new Promise((resolve) => setTimeout(resolve, retryDelay))
        }
      }
    }

    // 모든 재시도 실패
    if (showLoading) {
      isLoading.value = false
    }

    error.value = lastError?.message || 'API 호출이 모든 재시도에서 실패했습니다.'
    throw lastError
  }

  return {
    // 상태
    isLoading,
    error,
    data,

    // 메서드
    execute,
    executeParallel,
    executeIf,
    executeWithRetry,
    clearError,
    clearData,
    reset,
  }
}

/**
 * 특정 리소스에 대한 CRUD 작업을 위한 Composable
 * @param {Object} apiService API 서비스 객체
 * @returns {Object} CRUD 메서드들
 */
export function useResource(apiService) {
  const { execute, isLoading, error, data, clearError, reset } = useApi()

  /**
   * 목록 조회
   * @param {Object} params 쿼리 파라미터
   * @returns {Promise} 목록 데이터
   */
  const fetchList = async (params = {}) => {
    return execute(() => (apiService.getList ? apiService.getList(params) : apiService.get(params)))
  }

  /**
   * 상세 조회
   * @param {number|string} id 리소스 ID
   * @returns {Promise} 상세 데이터
   */
  const fetchDetail = async (id) => {
    return execute(() => (apiService.getDetail ? apiService.getDetail(id) : apiService.get(id)))
  }

  /**
   * 생성
   * @param {Object} data 생성할 데이터
   * @returns {Promise} 생성된 데이터
   */
  const create = async (data) => {
    return execute(() => apiService.create(data))
  }

  /**
   * 수정
   * @param {number|string} id 리소스 ID
   * @param {Object} data 수정할 데이터
   * @returns {Promise} 수정된 데이터
   */
  const update = async (id, data) => {
    return execute(() => apiService.update(id, data))
  }

  /**
   * 삭제
   * @param {number|string} id 리소스 ID
   * @returns {Promise} 삭제 응답
   */
  const remove = async (id) => {
    return execute(() => (apiService.delete ? apiService.delete(id) : apiService.remove(id)))
  }

  return {
    // 상태
    isLoading,
    error,
    data,

    // CRUD 메서드
    fetchList,
    fetchDetail,
    create,
    update,
    remove,

    // 유틸리티
    clearError,
    reset,
  }
}
