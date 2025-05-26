<!-- 재사용 가능한 모달 컴포넌트 -->
<template>
  <div
    v-if="modelValue"
    class="modal-overlay"
    @click="closeOnOverlayClick ? $emit('update:modelValue', false) : null"
  >
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>{{ title }}</h3>
        <button class="close-button" @click="$emit('update:modelValue', false)">&times;</button>
      </div>
      <div class="modal-body">
        <slot></slot>
      </div>
      <div v-if="$slots.footer" class="modal-footer">
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { watch, defineOptions } from 'vue'

defineOptions({
  name: 'BaseModal',
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

defineEmits(['update:modelValue'])

// 모달이 열리거나 닫힐 때 body에 클래스 추가/제거
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      document.body.classList.add('modal-open')
    } else {
      document.body.classList.remove('modal-open')
    }
  },
  { immediate: true },
)
</script>

<style>
body.modal-open {
  overflow: hidden;
  padding-right: 15px; /* 스크롤바 너비만큼 여백 추가 */
}
</style>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  overflow: hidden;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
}
</style>
