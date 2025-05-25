import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Main',
      component: () => import('@/views/MainView.vue'),
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('@/views/LandingView.vue'),
          meta: {
            title: '홈',
            requiresAuth: false,
            layout: 'default',
          },
        },
        {
          path: '/books',
          name: 'books',
          component: () => import('@/views/BookListView.vue'),
          meta: {
            title: '도서 목록',
            requiresAuth: false,
            layout: 'default',
          },
        },
        {
          path: '/books/:id',
          name: 'book-detail',
          component: () => import('@/views/BookDetailView.vue'),
          meta: {
            title: '도서 상세',
            requiresAuth: false,
            layout: 'default',
          },
        },
        {
          path: '/threads',
          name: 'threads',
          component: () => import('@/views/ThreadListView.vue'),
          meta: {
            title: '쓰레드 목록',
            requiresAuth: false,
            layout: 'default',
          },
        },
        {
          path: '/threads/:id',
          name: 'thread-detail',
          component: () => import('@/views/ThreadDetailView.vue'),
          meta: {
            title: '쓰레드 상세',
            requiresAuth: false,
            layout: 'default',
          },
        },
      ],
    },
    {
      path: '/signup',
      name: 'Signup',
      component: () => import('@/views/auth/SignupView.vue'),
      meta: {
        title: '회원가입',
        requiresGuest: true,
        layout: 'auth',
      },
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: {
        title: '로그인',
        requiresGuest: true,
        layout: 'auth',
      },
    },
    {
      path: '/verify-email/:uuid',
      name: 'EmailVerification',
      component: () => import('@/views/auth/EmailVerificationView.vue'),
      meta: {
        title: '이메일 인증',
        requiresGuest: true,
        layout: 'auth',
      },
    },
    {
      path: '/profile/:username',
      name: 'Profile',
      component: () => import('@/views/profile/ProfileView.vue'),
      meta: {
        title: '프로필',
        requiresAuth: true,
        layout: 'default',
      },
    },

    // 404 페이지 - 기본 컴포넌트로 대체
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/LandingView.vue'),
      meta: {
        title: '페이지를 찾을 수 없습니다',
        requiresAuth: false,
        layout: 'default',
      },
    },
  ],
})

/**
 * 라우터 가드는 authGate에서 처리됩니다.
 * 부트스트랩 게이트 패턴을 통해 앱 초기화 시 설정됩니다.
 */

/**
 * 라우터 이동 후 처리
 */
router.afterEach((to, from) => {
  console.log('📍 [ROUTER] 페이지 이동 완료:', {
    to: to.name,
    from: from.name,
    meta: to.meta,
  })

  // 페이지 타이틀 업데이트
  const defaultTitle = 'GoBooky'
  const pageTitle = to.meta.title
  document.title = pageTitle ? `${pageTitle} | ${defaultTitle}` : defaultTitle

  // 스크롤 위치 초기화 (필요한 경우)
  if (to.hash) {
    // 해시가 있으면 해당 요소로 스크롤
    setTimeout(() => {
      const element = document.querySelector(to.hash)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)
  } else if (to.name !== from.name) {
    // 다른 페이지로 이동하면 맨 위로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
})

/**
 * 라우터 에러 처리
 */
router.onError((error) => {
  console.error('❌ [ROUTER] 라우터 에러:', error)

  // 컴포넌트 로딩 실패 등의 에러 처리
  if (error.message.includes('Loading chunk')) {
    console.log('🔄 [ROUTER] 청크 로딩 실패 - 페이지 새로고침 권장')
    // 사용자에게 새로고침 안내 (실제 구현에서는 토스트 메시지 등 사용)
    if (confirm('페이지 로딩에 실패했습니다. 새로고침하시겠습니까?')) {
      window.location.reload()
    }
  }
})

export default router
