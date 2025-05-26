<template>
  <div id="app">
    <!-- 부트스트랩 게이트 로딩 중 스플래시 화면 -->
    <div v-if="isBootstrapping" class="splash-screen">
      <div class="splash-content">
        <div class="logo">
          <img src="/logo.png" alt="GoBooky" />
        </div>
        <div class="loading-spinner"></div>
        <p class="loading-text">GoBooky 로딩 중...</p>
      </div>
    </div>

    <!-- 메인 앱 -->
    <Suspense v-else>
      <RouterView />
    </Suspense>

    <!-- 토스트 알림 -->
    <Toast />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import { ref, onMounted } from 'vue'
import Toast from '@/components/Toast.vue'

// 부트스트랩 게이트 로딩 상태
const isBootstrapping = ref(true)

onMounted(() => {
  // 부트스트랩 게이트가 완료되면 스플래시 화면 숨김
  // main.js에서 authGate가 완료된 후 앱이 마운트되므로
  // 약간의 지연 후 스플래시 화면을 숨깁니다
  setTimeout(() => {
    isBootstrapping.value = false
  }, 100)
})
</script>

<style scoped>
#app {
  width: 100%;
  height: 100vh;
}

.splash-screen {
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

.splash-content {
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
  .splash-screen {
    background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  }
}
</style>
