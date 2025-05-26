import defaultProfileImage from '@/assets/images/default-profile.png'

/**
 * 프로필 이미지 URL을 반환하는 유틸리티 함수
 * @param {string|null} profileImageUrl - 사용자의 프로필 이미지 URL
 * @returns {string} 프로필 이미지 URL 또는 기본 이미지
 */
export function getProfileImageUrl(profileImageUrl) {
  return profileImageUrl || defaultProfileImage
}

/**
 * 이미지 로드 에러 처리 함수
 * @param {Event} event - 이미지 로드 에러 이벤트
 */
export function handleImageError(event) {
  console.warn('이미지 로드 실패, 기본 이미지로 대체:', event.target.src)
  event.target.src = defaultProfileImage
}

/**
 * 기본 프로필 이미지 URL
 */
export { defaultProfileImage }
