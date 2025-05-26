import { ref } from 'vue'

/**
 * 애니메이션 상태 관리 Composable
 * - 지침 준수: "비즈니스 로직은 훅으로"
 * - 재사용 가능한 애니메이션 상태 관리
 */
export function useAnimation() {
  const animatingItems = ref(new Set())

  /**
   * 애니메이션 시작
   * @param {string|number} id 아이템 ID
   * @param {number} duration 애니메이션 지속 시간 (ms)
   */
  const startAnimation = (id, duration = 600) => {
    animatingItems.value.add(id)

    // 자동으로 애니메이션 종료
    setTimeout(() => {
      endAnimation(id)
    }, duration)
  }

  /**
   * 애니메이션 종료
   * @param {string|number} id 아이템 ID
   */
  const endAnimation = (id) => {
    animatingItems.value.delete(id)
  }

  /**
   * 애니메이션 상태 확인
   * @param {string|number} id 아이템 ID
   * @returns {boolean} 애니메이션 중인지 여부
   */
  const isAnimating = (id) => {
    return animatingItems.value.has(id)
  }

  /**
   * 모든 애니메이션 초기화
   */
  const clearAnimations = () => {
    animatingItems.value.clear()
  }

  return {
    animatingItems,
    startAnimation,
    endAnimation,
    isAnimating,
    clearAnimations,
  }
}
