<template>
  <Teleport to="body">
    <Transition name="toast" appear>
      <div
        v-if="visible"
        :class="['toast', `toast--${type}`, { 'toast--dismissible': dismissible }]"
        @click="handleClick"
      >
        <div class="toast__icon">
          <component :is="iconComponent" />
        </div>
        <div class="toast__content">
          <div class="toast__title" v-if="title">{{ title }}</div>
          <div class="toast__message">{{ message }}</div>
        </div>
        <button v-if="dismissible" class="toast__close" @click.stop="close" aria-label="닫기">
          ×
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'error', 'warning', 'info'].includes(value),
  },
  title: {
    type: String,
    default: '',
  },
  message: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    default: 5000, // 5초
  },
  dismissible: {
    type: Boolean,
    default: true,
  },
  persistent: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close'])

const visible = ref(false)
let timeoutId = null

// 아이콘 컴포넌트 매핑
const iconComponent = computed(() => {
  const icons = {
    success: 'CheckIcon',
    error: 'XIcon',
    warning: 'ExclamationIcon',
    info: 'InfoIcon',
  }
  return icons[props.type] || 'InfoIcon'
})

const handleClick = () => {
  if (props.dismissible) {
    close()
  }
}

const close = () => {
  visible.value = false
  if (timeoutId) {
    clearTimeout(timeoutId)
    timeoutId = null
  }
  emit('close')
}

onMounted(() => {
  visible.value = true

  // persistent가 아니고 duration이 0보다 크면 자동 닫기
  if (!props.persistent && props.duration > 0) {
    timeoutId = setTimeout(() => {
      close()
    }, props.duration)
  }
})
</script>

<style scoped>
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  min-width: 300px;
  max-width: 500px;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  cursor: pointer;
}

.toast--dismissible {
  cursor: pointer;
}

.toast--success {
  background: #f0f9ff;
  border-left: 4px solid #10b981;
  color: #065f46;
}

.toast--error {
  background: #fef2f2;
  border-left: 4px solid #ef4444;
  color: #991b1b;
}

.toast--warning {
  background: #fffbeb;
  border-left: 4px solid #f59e0b;
  color: #92400e;
}

.toast--info {
  background: #f0f9ff;
  border-left: 4px solid #3b82f6;
  color: #1e40af;
}

.toast__icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  margin-top: 2px;
}

.toast__content {
  flex: 1;
  min-width: 0;
}

.toast__title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
  line-height: 1.4;
}

.toast__message {
  font-size: 14px;
  line-height: 1.4;
  word-wrap: break-word;
}

.toast__close {
  flex-shrink: 0;
  background: none;
  border: none;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.toast__close:hover {
  opacity: 1;
}

/* 트랜지션 */
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

/* 반응형 */
@media (max-width: 640px) {
  .toast {
    left: 20px;
    right: 20px;
    min-width: auto;
    max-width: none;
  }
}

/* 아이콘 스타일 (간단한 SVG 대체) */
.toast__icon::before {
  content: '';
  display: block;
  width: 20px;
  height: 20px;
  border-radius: 50%;
}

.toast--success .toast__icon::before {
  background: #10b981;
  content: '✓';
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.toast--error .toast__icon::before {
  background: #ef4444;
  content: '✕';
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.toast--warning .toast__icon::before {
  background: #f59e0b;
  content: '!';
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.toast--info .toast__icon::before {
  background: #3b82f6;
  content: 'i';
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}
</style>
