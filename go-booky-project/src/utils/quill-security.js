import DOMPurify from 'dompurify'

/**
 * Quill 에디터 XSS 방지 유틸리티
 * DOMPurify를 사용하여 Quill 콘텐츠를 안전하게 정화
 */

// Quill용 DOMPurify 설정
const quillPurifyConfig = {
  // Quill에서 사용하는 허용된 태그들
  ALLOWED_TAGS: [
    'p',
    'br',
    'strong',
    'em',
    'u',
    's',
    'ol',
    'ul',
    'li',
    'blockquote',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'a',
    'img',
    'video',
    'iframe',
    'span',
    'div',
  ],

  // 허용된 속성들
  ALLOWED_ATTR: [
    'href',
    'src',
    'alt',
    'title',
    'width',
    'height',
    'class',
    'style',
    'target',
    'rel',
  ],

  // 허용된 URI 스키마
  ALLOWED_URI_REGEXP:
    /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|data):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,

  // 빈 요소 제거
  REMOVE_EMPTY: true,

  // 스크립트 태그 완전 제거
  FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input'],

  // 위험한 속성 제거
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
}

/**
 * Quill 에디터 콘텐츠 정화
 * @param {string} content - 정화할 HTML 콘텐츠
 * @param {Object} customConfig - 사용자 정의 설정 (선택사항)
 * @returns {string} 정화된 HTML 콘텐츠
 */
export function sanitizeQuillContent(content, customConfig = {}) {
  if (!content || typeof content !== 'string') {
    return ''
  }

  const config = { ...quillPurifyConfig, ...customConfig }

  try {
    return DOMPurify.sanitize(content, config)
  } catch (error) {
    console.error('DOMPurify 정화 중 오류:', error)
    // 오류 발생 시 빈 문자열 반환 (안전한 기본값)
    return ''
  }
}

/**
 * Quill 에디터 Delta 형식 정화
 * @param {Object} delta - Quill Delta 객체
 * @returns {Object} 정화된 Delta 객체
 */
export function sanitizeQuillDelta(delta) {
  if (!delta || !delta.ops) {
    return { ops: [] }
  }

  const sanitizedOps = delta.ops.map((op) => {
    if (op.insert && typeof op.insert === 'string') {
      // 텍스트 삽입의 경우 HTML 정화
      return {
        ...op,
        insert: sanitizeQuillContent(op.insert),
      }
    }

    if (op.attributes) {
      // 속성에서 위험한 요소 제거
      const safeAttributes = { ...op.attributes }
      delete safeAttributes.script
      delete safeAttributes.onload
      delete safeAttributes.onerror

      return {
        ...op,
        attributes: safeAttributes,
      }
    }

    return op
  })

  return { ops: sanitizedOps }
}

/**
 * Quill 에디터 설정에 보안 옵션 추가
 * @param {Object} quillConfig - 기본 Quill 설정
 * @returns {Object} 보안이 강화된 Quill 설정
 */
export function getSecureQuillConfig(quillConfig = {}) {
  return {
    ...quillConfig,
    modules: {
      ...quillConfig.modules,
      // 클립보드 모듈에 정화 기능 추가
      clipboard: {
        ...quillConfig.modules?.clipboard,
        // 붙여넣기 시 콘텐츠 정화
        matchers: [
          ...(quillConfig.modules?.clipboard?.matchers || []),
          [
            Node.ELEMENT_NODE,
            (node, delta) => {
              // 모든 요소에 대해 정화 적용
              return sanitizeQuillDelta(delta)
            },
          ],
        ],
      },
    },
    // 위험한 형식 비활성화
    formats:
      quillConfig.formats?.filter((format) => !['script', 'object', 'embed'].includes(format)) ||
      [],
  }
}

/**
 * 실시간 콘텐츠 검증
 * @param {string} content - 검증할 콘텐츠
 * @returns {boolean} 안전한 콘텐츠인지 여부
 */
export function validateQuillContent(content) {
  if (!content) return true

  // 위험한 패턴 검사
  const dangerousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe[^>]*src\s*=\s*["'](?!https?:\/\/)/gi,
  ]

  return !dangerousPatterns.some((pattern) => pattern.test(content))
}

// 기본 내보내기
export default {
  sanitizeQuillContent,
  sanitizeQuillDelta,
  getSecureQuillConfig,
  validateQuillContent,
  quillPurifyConfig,
}
