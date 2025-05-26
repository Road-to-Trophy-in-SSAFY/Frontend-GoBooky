<template>
  <Teleport to="body">
    <div class="toast-container" aria-live="polite" aria-label="알림">
      <TransitionGroup name="toast" tag="div">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="['toast', `toast-${toast.type}`]"
          role="alert"
          :aria-label="`${toast.type} 알림: ${toast.message}`"
          @click="removeToast(toast.id)"
          @mouseenter="pauseToast(toast.id)"
          @mouseleave="resumeToast(toast.id)"
        >
          <div class="toast-content">
            <span class="toast-icon">
              <span v-if="toast.type === 'success'">✅</span>
              <span v-else-if="toast.type === 'error'">❌</span>
              <span v-else-if="toast.type === 'warning'">⚠️</span>
              <span v-else>ℹ️</span>
            </span>
            <span class="toast-message">{{ toast.message }}</span>
          </div>
          <button
            class="toast-close"
            @click.stop="removeToast(toast.id)"
            aria-label="알림 닫기"
            type="button"
          >
            ×
          </button>
          <!-- 프로그레스 바 (UX 개선) -->
          <div class="toast-progress" :class="`toast-progress-${toast.type}`"></div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useToast } from '@/composables/useToast'

defineOptions({
  name: 'ToastContainer',
})

const { toasts, removeToast, pauseToast, resumeToast } = useToast()
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  pointer-events: none;
}

.toast {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin-bottom: 12px;
  padding: 16px;
  min-width: 300px;
  max-width: 400px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  pointer-events: auto;
  cursor: pointer;
  border-left: 4px solid;
}

.toast-success {
  border-left-color: #10b981;
  background-color: #f0fdf4;
}

.toast-error {
  border-left-color: #ef4444;
  background-color: #fef2f2;
}

.toast-warning {
  border-left-color: #f59e0b;
  background-color: #fffbeb;
}

.toast-info {
  border-left-color: #3b82f6;
  background-color: #eff6ff;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.toast-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.toast-message {
  font-size: 14px;
  line-height: 1.4;
  color: #374151;
}

.toast-close {
  background: none;
  border: none;
  font-size: 20px;
  color: #9ca3af;
  cursor: pointer;
  padding: 0;
  margin-left: 12px;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.toast-close:hover {
  background-color: rgba(0, 0, 0, 0.1);
  color: #374151;
}

/* 애니메이션 */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}

/* 프로그레스 바 (UX 개선) */
.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: 100%;
  border-radius: 0 0 8px 8px;
  animation: toastProgress 4s linear forwards;
}

.toast-progress-success {
  background: linear-gradient(90deg, #10b981, #059669);
}

.toast-progress-error {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

.toast-progress-warning {
  background: linear-gradient(90deg, #f59e0b, #d97706);
}

.toast-progress-info {
  background: linear-gradient(90deg, #3b82f6, #2563eb);
}

@keyframes toastProgress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

/* 호버 시 프로그레스 바 일시정지 */
.toast:hover .toast-progress {
  animation-play-state: paused;
}
</style>
