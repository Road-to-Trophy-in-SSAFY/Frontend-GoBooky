import { ref, computed, watch } from 'vue'

/**
 * 지침에 따른 멀티스텝 폼 Composable
 * - 단계별 네비게이션 관리
 * - 진행 상태 추적
 * - 단계별 검증 지원
 */
export function useMultiStepForm(steps, options = {}) {
  const {
    initialStep = 0,
    allowSkip = false,
    persistProgress = false,
    storageKey = 'multiStepForm',
  } = options

  // 상태
  const currentStep = ref(initialStep)
  const completedSteps = ref(new Set())
  const stepData = ref({})
  const isTransitioning = ref(false)

  // 계산된 속성
  const totalSteps = computed(() => steps.length)
  const isFirstStep = computed(() => currentStep.value === 0)
  const isLastStep = computed(() => currentStep.value === totalSteps.value - 1)
  const progress = computed(() => ((currentStep.value + 1) / totalSteps.value) * 100)
  const currentStepConfig = computed(() => steps[currentStep.value] || {})

  /**
   * 특정 단계로 이동
   * @param {number} step 이동할 단계
   * @param {boolean} force 강제 이동 여부
   * @returns {Promise<boolean>} 이동 성공 여부
   */
  const goToStep = async (step, force = false) => {
    if (isTransitioning.value) return false

    // 유효한 단계인지 확인
    if (step < 0 || step >= totalSteps.value) {
      console.warn('❌ [useMultiStepForm] 유효하지 않은 단계:', step)
      return false
    }

    // 현재 단계와 같으면 무시
    if (step === currentStep.value) return true

    // 강제 이동이 아니고 건너뛰기가 허용되지 않는 경우
    if (!force && !allowSkip) {
      // 이전 단계들이 완료되었는지 확인
      for (let i = 0; i < step; i++) {
        if (!completedSteps.value.has(i)) {
          console.warn('❌ [useMultiStepForm] 이전 단계가 완료되지 않음:', i)
          return false
        }
      }
    }

    isTransitioning.value = true

    try {
      // 현재 단계의 beforeLeave 훅 실행
      const currentConfig = steps[currentStep.value]
      if (currentConfig?.beforeLeave) {
        const canLeave = await currentConfig.beforeLeave(stepData.value)
        if (!canLeave) {
          console.log('ℹ️ [useMultiStepForm] beforeLeave 훅에서 이동 차단')
          return false
        }
      }

      // 대상 단계의 beforeEnter 훅 실행
      const targetConfig = steps[step]
      if (targetConfig?.beforeEnter) {
        const canEnter = await targetConfig.beforeEnter(stepData.value)
        if (!canEnter) {
          console.log('ℹ️ [useMultiStepForm] beforeEnter 훅에서 이동 차단')
          return false
        }
      }

      // 단계 이동
      currentStep.value = step

      // 대상 단계의 afterEnter 훅 실행
      if (targetConfig?.afterEnter) {
        await targetConfig.afterEnter(stepData.value)
      }

      console.log('✅ [useMultiStepForm] 단계 이동 완료:', step)
      return true
    } catch (error) {
      console.error('❌ [useMultiStepForm] 단계 이동 중 오류:', error)
      return false
    } finally {
      isTransitioning.value = false
    }
  }

  /**
   * 다음 단계로 이동
   * @returns {Promise<boolean>} 이동 성공 여부
   */
  const nextStep = async () => {
    if (isLastStep.value) return false

    // 현재 단계 검증
    const isValid = await validateCurrentStep()
    if (!isValid) {
      console.log('❌ [useMultiStepForm] 현재 단계 검증 실패')
      return false
    }

    // 현재 단계를 완료된 단계로 표시
    completedSteps.value.add(currentStep.value)

    return goToStep(currentStep.value + 1)
  }

  /**
   * 이전 단계로 이동
   * @returns {Promise<boolean>} 이동 성공 여부
   */
  const prevStep = async () => {
    if (isFirstStep.value) return false
    return goToStep(currentStep.value - 1, true) // 이전 단계는 강제 이동
  }

  /**
   * 현재 단계 검증
   * @returns {Promise<boolean>} 검증 성공 여부
   */
  const validateCurrentStep = async () => {
    const config = currentStepConfig.value
    if (!config?.validate) return true

    try {
      const isValid = await config.validate(stepData.value)
      console.log(
        `${isValid ? '✅' : '❌'} [useMultiStepForm] 단계 ${currentStep.value} 검증:`,
        isValid,
      )
      return isValid
    } catch (error) {
      console.error('❌ [useMultiStepForm] 단계 검증 중 오류:', error)
      return false
    }
  }

  /**
   * 특정 단계 완료 표시
   * @param {number} step 완료할 단계
   */
  const markStepCompleted = (step) => {
    completedSteps.value.add(step)
  }

  /**
   * 특정 단계 완료 해제
   * @param {number} step 완료 해제할 단계
   */
  const markStepIncomplete = (step) => {
    completedSteps.value.delete(step)
  }

  /**
   * 단계 데이터 설정
   * @param {string} key 데이터 키
   * @param {any} value 데이터 값
   */
  const setStepData = (key, value) => {
    stepData.value[key] = value
  }

  /**
   * 단계 데이터 가져오기
   * @param {string} key 데이터 키
   * @returns {any} 데이터 값
   */
  const getStepData = (key) => {
    return stepData.value[key]
  }

  /**
   * 모든 단계 데이터 가져오기
   * @returns {Object} 전체 데이터
   */
  const getAllStepData = () => {
    return { ...stepData.value }
  }

  /**
   * 폼 초기화
   */
  const reset = () => {
    currentStep.value = initialStep
    completedSteps.value.clear()
    stepData.value = {}

    if (persistProgress) {
      localStorage.removeItem(storageKey)
    }
  }

  /**
   * 진행 상태 저장 (로컬 스토리지)
   */
  const saveProgress = () => {
    if (!persistProgress) return

    const progress = {
      currentStep: currentStep.value,
      completedSteps: Array.from(completedSteps.value),
      stepData: stepData.value,
      timestamp: Date.now(),
    }

    localStorage.setItem(storageKey, JSON.stringify(progress))
  }

  /**
   * 진행 상태 복원 (로컬 스토리지)
   */
  const restoreProgress = () => {
    if (!persistProgress) return

    try {
      const saved = localStorage.getItem(storageKey)
      if (!saved) return

      const progress = JSON.parse(saved)

      // 24시간 이내의 데이터만 복원
      const dayInMs = 24 * 60 * 60 * 1000
      if (Date.now() - progress.timestamp > dayInMs) {
        localStorage.removeItem(storageKey)
        return
      }

      currentStep.value = progress.currentStep || initialStep
      completedSteps.value = new Set(progress.completedSteps || [])
      stepData.value = progress.stepData || {}

      console.log('✅ [useMultiStepForm] 진행 상태 복원 완료')
    } catch (error) {
      console.error('❌ [useMultiStepForm] 진행 상태 복원 실패:', error)
      localStorage.removeItem(storageKey)
    }
  }

  // 진행 상태 자동 저장
  if (persistProgress) {
    watch([currentStep, completedSteps, stepData], saveProgress, { deep: true })

    // 컴포넌트 마운트 시 진행 상태 복원
    restoreProgress()
  }

  return {
    // 상태
    currentStep,
    completedSteps,
    stepData,
    isTransitioning,

    // 계산된 속성
    totalSteps,
    isFirstStep,
    isLastStep,
    progress,
    currentStepConfig,

    // 메서드
    goToStep,
    nextStep,
    prevStep,
    validateCurrentStep,
    markStepCompleted,
    markStepIncomplete,
    setStepData,
    getStepData,
    getAllStepData,
    reset,
    saveProgress,
    restoreProgress,
  }
}

/**
 * 회원가입 멀티스텝 폼 전용 Composable
 * @returns {Object} 회원가입 폼 관련 상태 및 메서드
 */
export function useSignupMultiStepForm() {
  const steps = [
    {
      name: 'email',
      label: '이메일 입력',
      component: 'EmailPasswordStep',
      validate: async (data) => {
        // 이메일과 비밀번호 검증 로직
        return Boolean(data.email && data.password && data.passwordConfirm)
      },
    },
    {
      name: 'verification',
      label: '이메일 인증',
      component: 'EmailVerificationStep',
      validate: async (data) => {
        // 이메일 인증 완료 검증
        return Boolean(data.emailVerified)
      },
    },
    {
      name: 'profile',
      label: '기본 정보',
      component: 'ProfileInfoStep',
      validate: async (data) => {
        // 기본 정보 검증
        return Boolean(
          data.username && data.first_name && data.last_name && data.gender && data.nicknameChecked,
        )
      },
    },
    {
      name: 'preferences',
      label: '독서 정보',
      component: 'ReadingPreferencesStep',
      validate: async (data) => {
        // 독서 정보 검증
        return Boolean(data.category_ids && data.category_ids.length > 0)
      },
    },
    {
      name: 'complete',
      label: '완료',
      component: 'CompletionStep',
      validate: async () => true,
    },
  ]

  const form = useMultiStepForm(steps, {
    persistProgress: true,
    storageKey: 'signup-progress',
  })

  return {
    ...form,
    steps,
  }
}
