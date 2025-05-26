<!-- 확인 모달 컴포넌트 -->
<template>
  <Modal
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :title="title"
    :close-on-overlay-click="false"
  >
    <div class="confirm-content">
      <p>{{ message }}</p>
    </div>
    <template #footer>
      <div class="confirm-actions">
        <button class="cancel-btn" @click="$emit('update:modelValue', false)">취소</button>
        <button class="confirm-btn" @click="confirm">{{ confirmText }}</button>
      </div>
    </template>
  </Modal>
</template>

<script setup>
import Modal from '@/components/Modal.vue'

defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    default: '확인',
  },
  message: {
    type: String,
    required: true,
  },
  confirmText: {
    type: String,
    default: '확인',
  },
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const confirm = () => {
  emit('confirm')
  emit('update:modelValue', false)
}
</script>

<style scoped>
.confirm-content {
  padding: 10px 0;
  text-align: center;
}

.confirm-actions {
  display: flex;
  gap: 10px;
}

.cancel-btn {
  padding: 8px 16px;
  background-color: #f1f1f1;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.confirm-btn {
  padding: 8px 16px;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
