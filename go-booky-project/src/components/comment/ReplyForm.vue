<template>
  <form @submit.prevent="handleSubmit" class="reply-form">
    <div class="form-group">
      <textarea
        v-model="content"
        :disabled="isSubmitting"
        placeholder="답글을 작성해주세요..."
        class="reply-textarea"
        rows="2"
        maxlength="500"
        @input="validateContent"
      ></textarea>

      <!-- 글자 수 표시 -->
      <div class="char-count">
        <span :class="{ 'text-danger': content.length > 500 }"> {{ content.length }}/500 </span>
      </div>

      <!-- 에러 메시지 -->
      <div v-if="validationError" class="validation-error">
        {{ validationError }}
      </div>
    </div>

    <div class="form-actions">
      <button type="submit" :disabled="!isValid || isSubmitting" class="submit-btn">
        <span v-if="isSubmitting">작성 중...</span>
        <span v-else>답글 작성</span>
      </button>
      <button type="button" @click="$emit('cancel')" :disabled="isSubmitting" class="cancel-btn">
        취소
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, computed } from 'vue'

defineProps({
  isSubmitting: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit', 'cancel'])

const content = ref('')
const validationError = ref('')

// 유효성 검사
const isValid = computed(() => {
  return content.value.trim().length >= 2 && content.value.length <= 500
})

// 내용 검증
const validateContent = () => {
  validationError.value = ''

  if (content.value.trim().length < 2 && content.value.trim().length > 0) {
    validationError.value = '답글은 2자 이상 입력해주세요.'
  } else if (content.value.length > 500) {
    validationError.value = '답글은 500자 이내로 작성해주세요.'
  }
}

// 폼 제출
const handleSubmit = () => {
  if (!isValid.value) return

  emit('submit', content.value.trim())
  content.value = ''
  validationError.value = ''
}
</script>

<style scoped>
.reply-form {
  padding: 1rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  margin-top: 0.5rem;
}

.form-group {
  margin-bottom: 0.75rem;
}

.reply-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.875rem;
  line-height: 1.5;
  resize: vertical;
  min-height: 60px;
  font-family: inherit;
}

.reply-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.reply-textarea:disabled {
  background: #f3f4f6;
  color: #6b7280;
  cursor: not-allowed;
}

.char-count {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.text-danger {
  color: #dc2626 !important;
}

.validation-error {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #dc2626;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
}

.submit-btn {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: #2563eb;
}

.submit-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.cancel-btn {
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn:hover:not(:disabled) {
  background: #e5e7eb;
}

.cancel-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
