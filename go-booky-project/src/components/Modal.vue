<!-- 재사용 가능한 모달 컴포넌트 -->
<template>
  <Teleport to="body">
    <Transition name="modal" appear>
      <div
        v-if="modelValue"
        class="modal-overlay"
        @click="closeOnOverlayClick ? $emit('update:modelValue', false) : null"
        @keydown.esc="$emit('update:modelValue', false)"
        tabindex="-1"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="title ? 'modal-title' : undefined"
      >
        <div class="modal-container">
          <div class="modal-content" @click.stop :class="$attrs.class">
            <div class="modal-header">
              <h3 v-if="title" id="modal-title" class="modal-title">{{ title }}</h3>
              <button
                class="close-button"
                @click="$emit('update:modelValue', false)"
                aria-label="모달 닫기"
                type="button"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>
            <div class="modal-body">
              <slot></slot>
            </div>
            <div v-if="$slots.footer" class="modal-footer">
              <slot name="footer"></slot>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { watch, nextTick, onMounted, onUnmounted } from 'vue'

defineOptions({
  name: 'BaseModal',
  inheritAttrs: false,
})

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    default: '',
  },
  closeOnOverlayClick: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['update:modelValue'])

// 이전 포커스된 요소 저장
let previousActiveElement = null

// 스크롤바 너비 계산
const getScrollbarWidth = () => {
  const outer = document.createElement('div')
  outer.style.visibility = 'hidden'
  outer.style.overflow = 'scroll'
  outer.style.msOverflowStyle = 'scrollbar'
  document.body.appendChild(outer)

  const inner = document.createElement('div')
  outer.appendChild(inner)

  const scrollbarWidth = outer.offsetWidth - inner.offsetWidth
  outer.parentNode.removeChild(outer)

  return scrollbarWidth
}

// 모달이 열리거나 닫힐 때 body 스타일 관리
watch(
  () => props.modelValue,
  async (isOpen) => {
    if (isOpen) {
      // 현재 포커스된 요소 저장
      previousActiveElement = document.activeElement

      // 스크롤바 너비 계산 및 CSS 변수 설정
      const scrollbarWidth = getScrollbarWidth()
      document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`)

      // body 스크롤 방지
      document.body.classList.add('modal-open')

      // 다음 틱에서 모달에 포커스
      await nextTick()
      const modalOverlay = document.querySelector('.modal-overlay')
      if (modalOverlay) {
        modalOverlay.focus()
      }
    } else {
      // body 스크롤 복원
      document.body.classList.remove('modal-open')
      document.documentElement.style.removeProperty('--scrollbar-width')

      // 이전 포커스 복원
      if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
        previousActiveElement.focus()
      }
      previousActiveElement = null
    }
  },
  { immediate: true },
)

// ESC 키 핸들러
const handleEscKey = (event) => {
  if (event.key === 'Escape' && props.modelValue) {
    emit('update:modelValue', false)
  }
}

// 컴포넌트 마운트/언마운트 시 이벤트 리스너 관리
onMounted(() => {
  document.addEventListener('keydown', handleEscKey)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscKey)

  // 컴포넌트가 언마운트될 때 body 클래스 정리
  if (props.modelValue) {
    document.body.classList.remove('modal-open')
    document.documentElement.style.removeProperty('--scrollbar-width')
  }
})
</script>

<style>
/* 전역 스타일 - body 스크롤 방지 */
body.modal-open {
  overflow: hidden;
  padding-right: var(--scrollbar-width, 0px);
}
</style>

<style scoped>
/* 모달 전환 애니메이션 */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.95) translateY(-20px);
}

/* 모달 오버레이 - 전체 화면 덮기 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  z-index: 9999;
  overflow: hidden;
  outline: none;
}

/* 모달 컨테이너 - 중앙 정렬 */
.modal-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 16px;
  box-sizing: border-box;
}

/* 모달 콘텐츠 */
.modal-content {
  background-color: white;
  border-radius: 16px;
  width: 100%;
  max-width: 800px;
  max-height: calc(100vh - 32px);
  overflow: hidden;
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  transform: scale(1) translateY(0);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
}

/* 모달 헤더 */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  flex-shrink: 0;
}

.modal-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.2;
}

.close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.close-button:hover {
  background: white;
  color: #374151;
  border-color: #d1d5db;
  transform: scale(1.05);
}

.close-button:active {
  transform: scale(0.95);
}

/* 모달 바디 */
.modal-body {
  padding: 32px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

/* 모달 푸터 */
.modal-footer {
  padding: 24px 32px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-shrink: 0;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .modal-container {
    padding: 12px;
    align-items: flex-start;
    padding-top: 20px;
  }

  .modal-content {
    max-height: calc(100vh - 40px);
    border-radius: 12px;
  }

  .modal-header {
    padding: 20px 24px;
  }

  .modal-title {
    font-size: 18px;
  }

  .close-button {
    width: 36px;
    height: 36px;
  }

  .modal-body {
    padding: 24px;
  }

  .modal-footer {
    padding: 20px 24px;
    flex-direction: column-reverse;
  }
}

@media (max-width: 480px) {
  .modal-container {
    padding: 8px;
    padding-top: 16px;
  }

  .modal-content {
    max-height: calc(100vh - 32px);
    border-radius: 8px;
  }

  .modal-header {
    padding: 16px 20px;
  }

  .modal-title {
    font-size: 16px;
  }

  .close-button {
    width: 32px;
    height: 32px;
  }

  .close-button svg {
    width: 20px;
    height: 20px;
  }

  .modal-body {
    padding: 20px;
  }

  .modal-footer {
    padding: 16px 20px;
  }
}

/* 극소형 화면 (360px 이하) */
@media (max-width: 360px) {
  .modal-container {
    padding: 4px;
    padding-top: 12px;
  }

  .modal-content {
    max-height: calc(100vh - 24px);
  }

  .modal-header {
    padding: 12px 16px;
  }

  .modal-body {
    padding: 16px;
  }

  .modal-footer {
    padding: 12px 16px;
  }
}

/* 스크롤바 스타일링 */
.modal-body::-webkit-scrollbar {
  width: 6px;
}

.modal-body::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* 포커스 관리 */
.modal-overlay:focus {
  outline: none;
}

/* 고대비 모드 지원 */
@media (prefers-contrast: high) {
  .modal-overlay {
    background-color: rgba(0, 0, 0, 0.9);
  }

  .modal-content {
    border: 2px solid #000;
  }

  .close-button {
    border: 2px solid #000;
  }
}

/* 애니메이션 감소 설정 */
@media (prefers-reduced-motion: reduce) {
  .modal-enter-active,
  .modal-leave-active {
    transition: opacity 0.2s ease;
  }

  .modal-enter-from .modal-content,
  .modal-leave-to .modal-content {
    transform: none;
  }

  .modal-content {
    transition: none;
  }

  .close-button {
    transition: none;
  }
}
</style>
