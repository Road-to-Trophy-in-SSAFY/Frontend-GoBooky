import { ref, reactive } from 'vue'

// 전역 이미지 캐시
const imageCache = reactive(new Map())
const loadingImages = reactive(new Set())

export function useImageCache() {
  const isLoading = ref(false)
  const error = ref(null)

  // 이미지 프리로드 함수
  const preloadImage = (src) => {
    return new Promise((resolve, reject) => {
      // 이미 캐시된 이미지면 즉시 반환
      if (imageCache.has(src)) {
        resolve(src)
        return
      }

      // 이미 로딩 중이면 기다림
      if (loadingImages.has(src)) {
        const checkLoaded = () => {
          if (imageCache.has(src)) {
            resolve(src)
          } else {
            setTimeout(checkLoaded, 50)
          }
        }
        checkLoaded()
        return
      }

      // 새로운 이미지 로드
      loadingImages.add(src)
      const img = new Image()

      img.onload = () => {
        imageCache.set(src, true)
        loadingImages.delete(src)
        resolve(src)
      }

      img.onerror = () => {
        loadingImages.delete(src)
        reject(new Error(`Failed to load image: ${src}`))
      }

      img.src = src
    })
  }

  // 여러 이미지 배치 프리로드
  const preloadImages = async (srcList) => {
    isLoading.value = true
    error.value = null

    try {
      const promises = srcList
        .filter((src) => src && src !== '/default-book-cover.jpg') // 기본 이미지는 제외
        .map((src) => preloadImage(src).catch(() => null)) // 개별 실패는 무시

      await Promise.allSettled(promises)
    } catch (err) {
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  // 이미지가 캐시되었는지 확인
  const isCached = (src) => {
    return imageCache.has(src)
  }

  // 캐시 클리어 (메모리 관리)
  const clearCache = () => {
    imageCache.clear()
    loadingImages.clear()
  }

  // 캐시 크기 제한 (최대 100개 이미지)
  const limitCacheSize = (maxSize = 100) => {
    if (imageCache.size > maxSize) {
      const keys = Array.from(imageCache.keys())
      const keysToDelete = keys.slice(0, imageCache.size - maxSize)
      keysToDelete.forEach((key) => imageCache.delete(key))
    }
  }

  return {
    isLoading,
    error,
    preloadImage,
    preloadImages,
    isCached,
    clearCache,
    limitCacheSize,
    cacheSize: () => imageCache.size,
  }
}
