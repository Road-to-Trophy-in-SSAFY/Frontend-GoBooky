import { useAuthStore } from '@/stores/auth'

/**
 * 부트스트랩 게이트 패턴
 * 앱 마운트 전에 세션 복구를 완료하여 새로고침 시 로그아웃 방지
 *
 * @param {Router} router Vue Router 인스턴스
 */
export async function authGate(router) {
  console.log('🚪 [AuthGate] 부트스트랩 게이트 시작')

  // 인증 스토어 초기화
  const authStore = useAuthStore()
  let isAuthenticated = false

  try {
    // 세션 복구 시도 (silent refresh)
    console.log('🔄 [AuthGate] 세션 복구 시도')
    isAuthenticated = await authStore.initAuth()

    if (isAuthenticated) {
      console.log('✅ [AuthGate] 세션 복구 성공 - 인증된 사용자')
    } else {
      console.log('👤 [AuthGate] 세션 없음 - 게스트 사용자')
    }
  } catch (error) {
    console.error('❌ [AuthGate] 세션 복구 실패:', error)
    isAuthenticated = false
  }

  // 라우터 가드 설정 (한 번만)
  router.beforeEach(async (to, from, next) => {
    console.log(`🛣️ [AuthGate] 라우팅: ${from.path} → ${to.path}`)
    console.log(`🔍 [AuthGate] 라우트 메타:`, to.meta)

    // 인증이 필요한 페이지 처리
    if (to.meta?.requiresAuth) {
      // 토큰이 없으면 한 번 더 갱신 시도 (silent)
      if (!authStore.isAuthenticated) {
        console.log('🔄 [AuthGate] 인증 상태 재확인 중...')
        const refreshSuccess = await authStore.silentRefresh()
        if (!refreshSuccess) {
          console.log('🚫 [AuthGate] 미인증 사용자 - 로그인 페이지로 리다이렉트')
          next({
            name: 'Login',
            query: { redirect: to.fullPath },
          })
          return
        }
      }

      console.log('✅ [AuthGate] 인증된 사용자 - 접근 허용')
      next()
      return
    }

    // Guest 전용 페이지 처리 (로그인된 사용자는 접근 불가)
    if (to.meta?.requiresGuest) {
      if (authStore.isAuthenticated) {
        console.log('ℹ️ [AuthGate] 이미 로그인된 사용자 - 홈으로 리다이렉트')
        // 로그인 페이지에서 redirect 쿼리가 있으면 해당 페이지로
        const redirectPath = from.query?.redirect || '/'
        next(redirectPath)
      } else {
        console.log('✅ [AuthGate] Guest 사용자 - 페이지 접근 허용')
        next()
      }
      return
    }

    // 일반 페이지는 그대로 진행
    console.log('✅ [AuthGate] 일반 페이지 - 접근 허용')
    next()
  })

  console.log('✅ [AuthGate] 부트스트랩 게이트 완료')
}
