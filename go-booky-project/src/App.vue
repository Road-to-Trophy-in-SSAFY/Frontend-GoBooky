<template>
  <div id="app">
    <!-- 메인 앱 -->
    <Suspense>
      <RouterView />

      <!-- 로딩 중 폴백 -->
      <template #fallback>
        <div class="loading-screen">
          <div class="loading-content">
            <div class="logo">
              <img src="/logo.png" alt="GoBooky" />
            </div>
            <div class="loading-spinner"></div>
            <p class="loading-text">페이지 로딩 중...</p>
          </div>
        </div>
      </template>
    </Suspense>

    <!-- 전역 토스트 알림 -->
    <Toast />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import Toast from '@/components/Toast.vue'

/**
 * 지침에 따른 단순한 App.vue
 * - 복잡한 부트스트랩 로직 제거
 * - Suspense로 비동기 컴포넌트 로딩 처리
 * - 전역 Toast 컴포넌트 포함
 */

defineOptions({
  name: 'App',
})
</script>

<style scoped>
#app {
  width: 100%;
  min-height: 100vh;
}

.loading-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #42b983 0%, #369870 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-content {
  text-align: center;
  color: white;
}

.logo {
  margin-bottom: 2rem;
}

.logo img {
  width: 80px;
  height: 80px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  margin: 0 auto 1rem;
  animation: spin 1s linear infinite;
}

.loading-text {
  font-size: 1.1rem;
  font-weight: 500;
  margin: 0;
  opacity: 0.9;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 다크 모드 대응 */
@media (prefers-color-scheme: dark) {
  .loading-screen {
    background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  }
}
</style>
