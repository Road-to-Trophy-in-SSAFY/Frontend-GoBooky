<template>
  <div class="secure-quill-editor">
    <div ref="quillContainer" class="quill-container"></div>
    <div v-if="showSecurityWarning" class="security-warning">
      ⚠️ 안전하지 않은 콘텐츠가 감지되어 정화되었습니다.
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import {
  sanitizeQuillContent,
  sanitizeQuillDelta,
  getSecureQuillConfig,
  validateQuillContent,
} from '@/utils/quill-security'

export default {
  name: 'SecureQuillEditor',
  props: {
    modelValue: {
      type: String,
      default: '',
    },
    options: {
      type: Object,
      default: () => ({}),
    },
    placeholder: {
      type: String,
      default: '내용을 입력하세요...',
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue', 'security-warning'],
  setup(props, { emit }) {
    const quillContainer = ref(null)
    const quill = ref(null)
    const showSecurityWarning = ref(false)

    // 보안이 강화된 Quill 설정
    const secureOptions = getSecureQuillConfig({
      theme: 'snow',
      placeholder: props.placeholder,
      readOnly: props.readonly,
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline', 'strike'],
          ['blockquote', 'code-block'],
          [{ header: 1 }, { header: 2 }],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ script: 'sub' }, { script: 'super' }],
          [{ indent: '-1' }, { indent: '+1' }],
          [{ direction: 'rtl' }],
          [{ size: ['small', false, 'large', 'huge'] }],
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          [{ color: [] }, { background: [] }],
          [{ font: [] }],
          [{ align: [] }],
          ['clean'],
          ['link'],
        ],
        ...props.options.modules,
      },
      ...props.options,
    })

    // Quill 에디터 초기화
    const initQuill = async () => {
      if (!quillContainer.value) return

      const Quill = (await import('quill')).default

      quill.value = new Quill(quillContainer.value, secureOptions)

      // 초기 콘텐츠 설정 (정화된 상태로)
      if (props.modelValue) {
        const sanitizedContent = sanitizeQuillContent(props.modelValue)
        quill.value.root.innerHTML = sanitizedContent
      }

      // 텍스트 변경 이벤트 리스너
      quill.value.on('text-change', handleTextChange)

      // 붙여넣기 이벤트 리스너
      quill.value.clipboard.addMatcher(Node.ELEMENT_NODE, (node, delta) => {
        const sanitizedDelta = sanitizeQuillDelta(delta)

        // 원본과 정화된 내용이 다르면 경고 표시
        if (JSON.stringify(delta) !== JSON.stringify(sanitizedDelta)) {
          showSecurityWarning.value = true
          emit('security-warning', '위험한 콘텐츠가 제거되었습니다.')

          // 3초 후 경고 숨김
          setTimeout(() => {
            showSecurityWarning.value = false
          }, 3000)
        }

        return sanitizedDelta
      })
    }

    // 텍스트 변경 핸들러
    const handleTextChange = () => {
      if (!quill.value) return

      const content = quill.value.root.innerHTML

      // 콘텐츠 검증
      if (!validateQuillContent(content)) {
        // 위험한 콘텐츠 감지 시 정화
        const sanitizedContent = sanitizeQuillContent(content)
        quill.value.root.innerHTML = sanitizedContent

        showSecurityWarning.value = true
        emit('security-warning', '위험한 콘텐츠가 감지되어 제거되었습니다.')

        setTimeout(() => {
          showSecurityWarning.value = false
        }, 3000)

        emit('update:modelValue', sanitizedContent)
      } else {
        emit('update:modelValue', content)
      }
    }

    // props.modelValue 변경 감지
    watch(
      () => props.modelValue,
      (newValue) => {
        if (!quill.value) return

        const currentContent = quill.value.root.innerHTML
        const sanitizedNewValue = sanitizeQuillContent(newValue || '')

        if (currentContent !== sanitizedNewValue) {
          quill.value.root.innerHTML = sanitizedNewValue
        }
      },
    )

    // 컴포넌트 마운트
    onMounted(() => {
      initQuill()
    })

    // 컴포넌트 언마운트
    onUnmounted(() => {
      if (quill.value) {
        quill.value.off('text-change', handleTextChange)
      }
    })

    return {
      quillContainer,
      showSecurityWarning,
    }
  },
}
</script>

<style scoped>
.secure-quill-editor {
  position: relative;
}

.quill-container {
  min-height: 200px;
}

.security-warning {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  color: #856404;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  z-index: 1000;
  animation: fadeInOut 3s ease-in-out;
}

@keyframes fadeInOut {
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }
  10% {
    opacity: 1;
    transform: translateY(0);
  }
  90% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-10px);
  }
}

/* Quill 에디터 스타일 커스터마이징 */
:deep(.ql-editor) {
  min-height: 150px;
  font-family: 'Noto Sans KR', sans-serif;
}

:deep(.ql-toolbar) {
  border-top: 1px solid #ccc;
  border-left: 1px solid #ccc;
  border-right: 1px solid #ccc;
}

:deep(.ql-container) {
  border-bottom: 1px solid #ccc;
  border-left: 1px solid #ccc;
  border-right: 1px solid #ccc;
}
</style>
