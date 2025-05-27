<template>
  <form @submit.prevent="handleSubmit" class="comment-form">
    <div class="form-group">
      <textarea
        v-model="content"
        :disabled="isSubmitting"
        placeholder="댓글을 작성해주세요..."
        class="comment-textarea"
        data-testid="comment-input"
        rows="3"
        maxlength="1000"
        @input="validateContent"
      ></textarea>

      <!-- 글자 수 표시 -->
      <div class="char-count">
        <span :class="{ 'text-danger': content.length > 1000 }"> {{ content.length }}/1000 </span>
      </div>

      <!-- 에러 메시지 -->
      <div v-if="validationError" class="validation-error" data-testid="comment-error">
        {{ validationError }}
      </div>
    </div>

    <div class="form-actions">
      <button
        type="submit"
        :disabled="!isValid || isSubmitting"
        class="submit-btn"
        data-testid="comment-submit"
      >
        <span v-if="isSubmitting">작성 중...</span>
        <span v-else>댓글 작성</span>
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  isSubmitting: {
    type: Boolean,
    default: false,
  },
  placeholder: {
    type: String,
    default: '댓글을 작성해주세요...',
  },
  maxLength: {
    type: Number,
    default: 1000,
  },
})

const emit = defineEmits(['submit'])

const content = ref('')
const validationError = ref('')

// 유효성 검사
const isValid = computed(() => {
  return (
    content.value.trim().length >= 3 &&
    content.value.length <= props.maxLength &&
    !validationError.value
  )
})

// 내용 검증
const validateContent = () => {
  const trimmedContent = content.value.trim()

  if (trimmedContent.length === 0) {
    validationError.value = ''
    return
  }

  if (trimmedContent.length < 3) {
    validationError.value = '댓글은 최소 3자 이상 입력해주세요.'
    return
  }

  if (content.value.length > props.maxLength) {
    validationError.value = `댓글은 ${props.maxLength}자 이내로 작성해주세요.`
    return
  }

  // 동일 문자 반복 체크
  if (new Set(trimmedContent).size < 2) {
    validationError.value = '의미 있는 댓글을 작성해주세요.'
    return
  }

  validationError.value = ''
}

// 폼 제출
const handleSubmit = () => {
  if (!isValid.value) return

  const trimmedContent = content.value.trim()
  emit('submit', trimmedContent)

  // 폼 초기화
  content.value = ''
  validationError.value = ''
}
</script>

<style scoped>
.comment-form {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.form-group {
  margin-bottom: 1rem;
}

.comment-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  line-height: 1.5;
  resize: vertical;
  min-height: 80px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.comment-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.comment-textarea:disabled {
  background: #f3f4f6;
  color: #6b7280;
  cursor: not-allowed;
}

.char-count {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.text-danger {
  color: #dc2626 !important;
}

.validation-error {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 4px;
  color: #dc2626;
  font-size: 0.875rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.submit-btn {
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: #2563eb;
}

.submit-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.submit-btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}
</style>
