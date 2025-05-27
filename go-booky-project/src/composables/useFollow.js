import { ref } from 'vue'
import api from '@/api'
import { toast } from '@/composables/useToast'

/**
 * 팔로우 기능을 위한 Composable
 * Optimistic UI 패턴과 에러 핸들링을 포함
 */
export function useFollow() {
  const isLoading = ref(false)

  /**
   * 팔로우/언팔로우 토글
   * @param {Object} profile - 프로필 객체 (reactive)
   * @param {string} username - 대상 사용자명
   * @returns {Promise<boolean>} 성공 여부
   */
  const toggleFollow = async (profile, username) => {
    if (isLoading.value) return false

    // Optimistic UI: 이전 상태 저장
    const previousFollowState = profile.is_following
    const previousFollowersCount = profile.followers_count

    try {
      isLoading.value = true

      // UI 즉시 업데이트 (Optimistic)
      profile.is_following = !previousFollowState
      profile.followers_count = previousFollowState
        ? previousFollowersCount - 1
        : previousFollowersCount + 1

      // 서버 요청
      const response = await api.post(`/auth/auth/profile/${username}/follow/`)

      // 서버 응답으로 최종 확정
      profile.is_following = response.data.is_following
      profile.followers_count = response.data.followers_count

      // 성공 메시지 (자연스러운 타이밍)
      setTimeout(() => {
        toast.success(
          response.data.is_following ? '✨ 팔로우 했습니다!' : '👋 팔로우를 해제했습니다.',
        )
      }, 200)

      return true
    } catch (error) {
      console.error('❌ 팔로우 처리 실패:', error)

      // 실패 시 이전 상태로 롤백
      profile.is_following = previousFollowState
      profile.followers_count = previousFollowersCount

      // 에러 메시지
      const errorMessage =
        error.response?.data?.detail || '팔로우 처리에 실패했습니다. 다시 시도해주세요.'
      toast.error(errorMessage)

      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 팔로우 상태 확인
   * @param {string} username - 대상 사용자명
   * @returns {Promise<Object>} 팔로우 정보
   */
  const getFollowStatus = async (username) => {
    try {
      const response = await api.get(`/auth/auth/profile/${username}/follow-status/`)
      return response.data
    } catch (error) {
      console.error('❌ 팔로우 상태 조회 실패:', error)
      throw error
    }
  }

  /**
   * 팔로워 목록 조회 (필요시 사용)
   * @param {string} username - 대상 사용자명
   * @param {number} page - 페이지 번호
   * @returns {Promise<Object>} 팔로워 목록
   */
  const getFollowers = async (username, page = 1) => {
    try {
      const response = await api.get(`/auth/auth/profile/${username}/followers/`, {
        params: { page },
      })
      return response.data
    } catch (error) {
      console.error('❌ 팔로워 목록 조회 실패:', error)
      throw error
    }
  }

  /**
   * 팔로잉 목록 조회 (필요시 사용)
   * @param {string} username - 대상 사용자명
   * @param {number} page - 페이지 번호
   * @returns {Promise<Object>} 팔로잉 목록
   */
  const getFollowing = async (username, page = 1) => {
    try {
      const response = await api.get(`/auth/auth/profile/${username}/following/`, {
        params: { page },
      })
      return response.data
    } catch (error) {
      console.error('❌ 팔로잉 목록 조회 실패:', error)
      throw error
    }
  }

  return {
    isLoading,
    toggleFollow,
    getFollowStatus,
    getFollowers,
    getFollowing,
  }
}
