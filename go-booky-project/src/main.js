import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import App from './App.vue'
import router from './router'
import { authGate } from './bootstrap/authGate'

/**
 * 부트스트랩 게이트 패턴을 적용한 Vue 앱 초기화
 * - 앱 마운트 전에 세션 복구 완료
 * - 새로고침 시 로그아웃 방지
 * - 라우터 가드 설정
 */

console.log('🚀 [APP] GoBooky 앱 초기화 시작...')

// Pinia 생성 및 플러그인 추가
const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)

// 글로벌 에러 핸들링
app.config.errorHandler = (err, instance, info) => {
  console.error('❌ [APP] 글로벌 에러:', {
    error: err,
    instance,
    info,
  })

  // 개발 환경에서는 에러를 다시 던져서 개발자 도구에서 확인 가능
  if (import.meta.env.DEV) {
    throw err
  }
}

// 글로벌 경고 핸들링
app.config.warnHandler = (msg, instance, trace) => {
  console.warn('⚠️ [APP] 글로벌 경고:', {
    message: msg,
    instance,
    trace,
  })
}

/**
 * 부트스트랩 게이트 패턴을 적용한 앱 초기화
 */
async function initializeApp() {
  const startTime = performance.now()

  try {
    console.log('🔍 [APP] 부트스트랩 게이트 패턴 적용 중...')

    // 1. 라우터 마운트 전에 세션 복구 완료
    await authGate(router)

    // 2. 라우터 설정 (세션 복구 후)
    app.use(router)

    // 환경 정보 로깅
    console.log('ℹ️ [APP] 환경 정보:', {
      mode: import.meta.env.MODE,
      dev: import.meta.env.DEV,
      baseUrl: import.meta.env.BASE_URL,
      apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
    })
  } catch (error) {
    console.error('❌ [APP] 부트스트랩 게이트 실패:', error)

    // 부트스트랩 게이트 실패해도 앱은 정상적으로 시작
    app.use(router)
    console.log('👤 [APP] 부트스트랩 게이트 실패 - 기본 모드로 시작')
  }

  try {
    // 앱 마운트
    console.log('🎯 [APP] 앱 마운트 중...')
    app.mount('#app')

    const endTime = performance.now()
    const initTime = Math.round(endTime - startTime)

    console.log(`✅ [APP] GoBooky 앱 초기화 완료! (${initTime}ms)`)

    // 개발 환경에서 성능 정보 표시
    if (import.meta.env.DEV) {
      console.log('🔧 [APP] 개발 모드 - 성능 정보:', {
        initializationTime: `${initTime}ms`,
        userAgent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
      })
    }
  } catch (error) {
    console.error('❌ [APP] 앱 마운트 실패:', error)

    // 마운트 실패 시 사용자에게 안내
    document.body.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        text-align: center;
        padding: 20px;
      ">
        <h1 style="color: #e74c3c; margin-bottom: 20px;">앱 로딩 실패</h1>
        <p style="color: #7f8c8d; margin-bottom: 30px;">
          앱을 로드하는 중 오류가 발생했습니다.<br>
          페이지를 새로고침하거나 잠시 후 다시 시도해주세요.
        </p>
        <button 
          onclick="window.location.reload()" 
          style="
            background: #3498db;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
          "
        >
          새로고침
        </button>
      </div>
    `
  }
}

// 앱 초기화 실행
initializeApp().catch((error) => {
  console.error('❌ [APP] 앱 초기화 중 치명적 오류:', error)

  // 치명적 오류 발생 시 기본 에러 페이지 표시
  document.body.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      text-align: center;
      padding: 20px;
    ">
      <h1 style="color: #e74c3c; margin-bottom: 20px;">시스템 오류</h1>
      <p style="color: #7f8c8d; margin-bottom: 30px;">
        시스템 초기화 중 오류가 발생했습니다.<br>
        관리자에게 문의하거나 잠시 후 다시 시도해주세요.
      </p>
      <button 
        onclick="window.location.reload()" 
        style="
          background: #e74c3c;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
        "
      >
        새로고침
      </button>
    </div>
  `
})
