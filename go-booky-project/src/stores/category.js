import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { categoriesData } from '@/stores/categoriesData.js'

export const useCategoryStore = defineStore('category', () => {
  const categories = ref(categoriesData)

  // 전체 카테고리 반환
  const getAllCategories = computed(() => categories.value)

  // pk로 카테고리 찾기
  function getCategoryByPk(pk) {
    return categories.value.find((cat) => cat.pk === pk)
  }

  return { categories, getAllCategories, getCategoryByPk }
})
