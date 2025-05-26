<template>
  <input
    :type="type"
    :value="modelValue"
    @input="handleInput"
    :placeholder="placeholder"
    :class="inputClass"
  />
</template>

<script setup>
import { watch } from 'vue'
import DOMPurify from 'dompurify'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
  placeholder: {
    type: String,
    default: '',
  },
  inputClass: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

const handleInput = (event) => {
  const value = event.target.value

  // 숫자 타입 입력인 경우 숫자로 변환하여 emit
  if (props.type === 'number') {
    const numValue = value === '' ? null : Number(value)
    emit('update:modelValue', numValue)
  } else {
    // 텍스트 타입인 경우에만 sanitize 적용
    const sanitizedValue = DOMPurify.sanitize(value)
    emit('update:modelValue', sanitizedValue)
  }
}

// 초기값도 타입에 따라 처리
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue && typeof newValue === 'string') {
      const sanitizedValue = DOMPurify.sanitize(newValue)
      if (sanitizedValue !== newValue) {
        emit('update:modelValue', sanitizedValue)
      }
    }
  },
  { immediate: true },
)
</script>
