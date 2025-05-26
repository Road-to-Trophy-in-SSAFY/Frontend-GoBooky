import { ref } from 'vue'

/**
 * 애니메이션 상태 관리 Composable
 * - 지침 준수: "비즈니스 로직은 훅으로"
 * - 재사용 가능한 애니메이션 상태 관리
 */
export function useAnimation() {
  const animatingIds = ref(new Set())

  /**
   * 애니메이션 시작
   * @param {string|number} id 아이템 ID
   */
  const startAnimation = (id) => {
    if (animatingIds.value.has(id)) return

    animatingIds.value.add(id)
    setTimeout(() => {
      animatingIds.value.delete(id)
    }, 600) // 애니메이션 지속 시간과 일치
  }

  /**
   * 애니메이션 상태 확인
   * @param {string|number} id 아이템 ID
   * @returns {boolean} 애니메이션 중인지 여부
   */
  const isAnimating = (id) => animatingIds.value.has(id)

  /**
   * 모든 애니메이션 초기화
   */
  const clearAnimations = () => {
    animatingIds.value.clear()
  }

  return {
    startAnimation,
    isAnimating,
    clearAnimations,
  }
}
