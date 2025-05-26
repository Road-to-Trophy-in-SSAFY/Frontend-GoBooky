import { test, expect } from '@playwright/test'

/**
 * GoBooky 도서 API 테스트
 * - 도서 목록/상세 조회
 * - 카테고리 필터링
 * - ViewSet 기반 API
 */

const BASE_URL = 'http://127.0.0.1:8000'
const FRONTEND_URL = 'http://localhost:5173'

test.describe('도서 API 테스트 (ViewSet)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FRONTEND_URL)
  })

  test('도서 목록 조회 API', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/books/`)

    expect(response.status()).toBe(200)
    const books = await response.json()

    // 응답 구조 확인
    expect(books).toHaveProperty('results')
    expect(Array.isArray(books.results)).toBeTruthy()

    // 페이지네이션 정보 확인
    expect(books).toHaveProperty('count')
    expect(books).toHaveProperty('next')
    expect(books).toHaveProperty('previous')

    // 도서 데이터 구조 확인
    if (books.results.length > 0) {
      const book = books.results[0]
      expect(book).toHaveProperty('id')
      expect(book).toHaveProperty('title')
      expect(book).toHaveProperty('author')
      expect(book).toHaveProperty('category_name')
      expect(book).toHaveProperty('image_url')
    }
  })

  test('카테고리별 도서 필터링 API', async ({ request }) => {
    // 먼저 카테고리 목록 조회
    const categoriesResponse = await request.get(`${BASE_URL}/api/categories/`)
    expect(categoriesResponse.status()).toBe(200)

    const categories = await categoriesResponse.json()
    expect(Array.isArray(categories)).toBeTruthy()

    if (categories.length > 0) {
      const categoryId = categories[0].pk

      // 특정 카테고리로 필터링
      const booksResponse = await request.get(`${BASE_URL}/api/books/?category=${categoryId}`)
      expect(booksResponse.status()).toBe(200)

      const books = await booksResponse.json()
      expect(books).toHaveProperty('results')

      // 필터링된 결과의 카테고리 확인
      if (books.results.length > 0) {
        books.results.forEach((book) => {
          expect(book.category_id).toBe(categoryId)
        })
      }
    }
  })

  test('도서 상세 조회 API', async ({ request }) => {
    // 먼저 도서 목록에서 첫 번째 도서 ID 가져오기
    const listResponse = await request.get(`${BASE_URL}/api/books/`)
    expect(listResponse.status()).toBe(200)

    const books = await listResponse.json()

    if (books.results.length > 0) {
      const bookId = books.results[0].id

      // 도서 상세 조회
      const detailResponse = await request.get(`${BASE_URL}/api/books/${bookId}/`)
      expect(detailResponse.status()).toBe(200)

      const book = await detailResponse.json()

      // 상세 정보 구조 확인
      expect(book).toHaveProperty('id')
      expect(book).toHaveProperty('title')
      expect(book).toHaveProperty('author')
      expect(book).toHaveProperty('description')
      expect(book).toHaveProperty('category_name')
      expect(book).toHaveProperty('image_url')
      expect(book).toHaveProperty('threads_count')
      expect(book.id).toBe(bookId)
    }
  })

  test('존재하지 않는 도서 조회', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/books/99999/`)
    expect(response.status()).toBe(404)
  })

  test('잘못된 카테고리 ID로 필터링', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/books/?category=invalid`)

    // 잘못된 카테고리 ID는 빈 결과를 반환하거나 400 에러
    expect([200, 400]).toContain(response.status())

    if (response.status() === 200) {
      const books = await response.json()
      expect(books.results.length).toBe(0)
    }
  })

  test('페이지네이션 테스트', async ({ request }) => {
    // 첫 번째 페이지
    const page1Response = await request.get(`${BASE_URL}/api/books/?page=1`)
    expect(page1Response.status()).toBe(200)

    const page1Data = await page1Response.json()
    expect(page1Data).toHaveProperty('results')
    expect(page1Data).toHaveProperty('count')

    // 두 번째 페이지 (있다면)
    if (page1Data.next) {
      const page2Response = await request.get(`${BASE_URL}/api/books/?page=2`)
      expect(page2Response.status()).toBe(200)

      const page2Data = await page2Response.json()
      expect(page2Data).toHaveProperty('results')

      // 다른 페이지의 결과는 달라야 함
      if (page1Data.results.length > 0 && page2Data.results.length > 0) {
        expect(page1Data.results[0].id).not.toBe(page2Data.results[0].id)
      }
    }
  })
})

test.describe('카테고리 API 테스트', () => {
  test('카테고리 목록 조회 API', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/categories/`)

    expect(response.status()).toBe(200)
    const categories = await response.json()
    expect(Array.isArray(categories)).toBeTruthy()
    expect(categories.length).toBeGreaterThan(0)

    // 카테고리 구조 확인
    if (categories.length > 0) {
      const category = categories[0]
      expect(category).toHaveProperty('pk')
      expect(category).toHaveProperty('fields')
      expect(category.fields).toHaveProperty('name')
      expect(typeof category.pk).toBe('number')
      expect(typeof category.fields.name).toBe('string')
    }
  })
})

test.describe('레거시 도서 API 테스트', () => {
  test('레거시 도서 목록 조회 API', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/legacy/books/`)

    expect(response.status()).toBe(200)
    const books = await response.json()
    expect(Array.isArray(books)).toBeTruthy()

    // 레거시 API는 배열 형태로 반환
    if (books.length > 0) {
      const book = books[0]
      expect(book).toHaveProperty('id')
      expect(book).toHaveProperty('title')
      expect(book).toHaveProperty('author')
    }
  })

  test('레거시 도서 상세 조회 API', async ({ request }) => {
    // 먼저 도서 목록에서 첫 번째 도서 ID 가져오기
    const listResponse = await request.get(`${BASE_URL}/legacy/books/`)
    expect(listResponse.status()).toBe(200)

    const books = await listResponse.json()

    if (books.length > 0) {
      const bookId = books[0].id

      // 레거시 도서 상세 조회
      const detailResponse = await request.get(`${BASE_URL}/legacy/books/${bookId}/`)
      expect(detailResponse.status()).toBe(200)

      const book = await detailResponse.json()
      expect(book).toHaveProperty('id')
      expect(book).toHaveProperty('title')
      expect(book.id).toBe(bookId)
    }
  })

  test('레거시 카테고리 필터링', async ({ request }) => {
    // 카테고리 1로 필터링
    const response = await request.get(`${BASE_URL}/legacy/books/?category=1`)
    expect(response.status()).toBe(200)

    const books = await response.json()
    expect(Array.isArray(books)).toBeTruthy()

    // 필터링된 결과 확인
    if (books.length > 0) {
      books.forEach((book) => {
        expect(book.category_id).toBe(1)
      })
    }
  })
})

test.describe('API 성능 및 캐시 테스트', () => {
  test('동일한 요청의 응답 시간 비교 (캐시 효과)', async ({ request }) => {
    // 첫 번째 요청 (캐시 미스)
    const start1 = Date.now()
    const response1 = await request.get(`${BASE_URL}/api/books/`)
    const end1 = Date.now()
    const time1 = end1 - start1

    expect(response1.status()).toBe(200)

    // 두 번째 요청 (캐시 히트 예상)
    const start2 = Date.now()
    const response2 = await request.get(`${BASE_URL}/api/books/`)
    const end2 = Date.now()
    const time2 = end2 - start2

    expect(response2.status()).toBe(200)

    // 응답 내용이 동일한지 확인
    const data1 = await response1.json()
    const data2 = await response2.json()
    expect(data1).toEqual(data2)

    console.log(`첫 번째 요청: ${time1}ms, 두 번째 요청: ${time2}ms`)

    // 두 번째 요청이 더 빠를 것으로 예상 (캐시 효과)
    // 하지만 네트워크 상황에 따라 다를 수 있으므로 로그만 출력
  })

  test('여러 API 동시 호출 테스트', async ({ request }) => {
    const promises = [
      request.get(`${BASE_URL}/api/books/`),
      request.get(`${BASE_URL}/api/categories/`),
      request.get(`${BASE_URL}/auth/auth/categories/`),
    ]

    const responses = await Promise.all(promises)

    // 모든 요청이 성공해야 함
    responses.forEach((response) => {
      expect(response.status()).toBe(200)
    })
  })
})
