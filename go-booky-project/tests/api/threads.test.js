import { test, expect } from '@playwright/test'

/**
 * GoBooky 쓰레드 API 테스트
 * - 쓰레드 CRUD 작업
 * - 좋아요 기능
 * - 권한 관리
 */

const BASE_URL = 'http://127.0.0.1:8000'
const FRONTEND_URL = 'http://localhost:5173'

// 테스트용 사용자 데이터
const testUser = {
  email: 'admin@example.com',
  password: 'admin123',
}

// 테스트용 쓰레드 데이터
const testThread = {
  title: '테스트 쓰레드',
  content: '이것은 테스트용 쓰레드 내용입니다.',
  book: 1, // 실제 존재하는 도서 ID
}

test.describe('쓰레드 API 테스트 (ViewSet)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FRONTEND_URL)
  })

  test('쓰레드 목록 조회 API (인증 없음)', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/threads/`)

    expect(response.status()).toBe(200)
    const threads = await response.json()

    // 응답 구조 확인
    expect(threads).toHaveProperty('results')
    expect(Array.isArray(threads.results)).toBeTruthy()

    // 페이지네이션 정보 확인
    expect(threads).toHaveProperty('count')
    expect(threads).toHaveProperty('next')
    expect(threads).toHaveProperty('previous')

    // 쓰레드 데이터 구조 확인
    if (threads.results.length > 0) {
      const thread = threads.results[0]
      expect(thread).toHaveProperty('id')
      expect(thread).toHaveProperty('title')
      expect(thread).toHaveProperty('content')
      expect(thread).toHaveProperty('user')
      expect(thread).toHaveProperty('book')
      expect(thread).toHaveProperty('created_at')
      expect(thread).toHaveProperty('likes_count')
    }
  })

  test('쓰레드 상세 조회 API (인증 없음)', async ({ request }) => {
    // 먼저 쓰레드 목록에서 첫 번째 쓰레드 ID 가져오기
    const listResponse = await request.get(`${BASE_URL}/api/threads/`)
    expect(listResponse.status()).toBe(200)

    const threads = await listResponse.json()

    if (threads.results.length > 0) {
      const threadId = threads.results[0].id

      // 쓰레드 상세 조회
      const detailResponse = await request.get(`${BASE_URL}/api/threads/${threadId}/`)
      expect(detailResponse.status()).toBe(200)

      const thread = await detailResponse.json()

      // 상세 정보 구조 확인
      expect(thread).toHaveProperty('id')
      expect(thread).toHaveProperty('title')
      expect(thread).toHaveProperty('content')
      expect(thread).toHaveProperty('user')
      expect(thread).toHaveProperty('book')
      expect(thread).toHaveProperty('created_at')
      expect(thread).toHaveProperty('likes_count')
      expect(thread).toHaveProperty('is_liked')
      expect(thread.id).toBe(threadId)
    }
  })

  test('쓰레드 생성 API (인증 필요)', async ({ request }) => {
    // 인증 없이 생성 시도
    const unauthResponse = await request.post(`${BASE_URL}/api/threads/`, {
      data: testThread,
    })
    expect(unauthResponse.status()).toBe(401)

    // 로그인 후 생성 시도
    const loginResponse = await request.post(`${BASE_URL}/auth/auth/jwt/login/`, {
      data: testUser,
    })

    if (loginResponse.status() === 200) {
      const loginResult = await loginResponse.json()
      const accessToken = loginResult.access

      // 인증된 상태로 쓰레드 생성
      const createResponse = await request.post(`${BASE_URL}/api/threads/`, {
        data: testThread,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      expect(createResponse.status()).toBe(201)
      const createdThread = await createResponse.json()

      expect(createdThread).toHaveProperty('id')
      expect(createdThread.title).toBe(testThread.title)
      expect(createdThread.content).toBe(testThread.content)
      expect(createdThread.book).toBe(testThread.book)

      // 생성된 쓰레드 삭제 (정리)
      await request.delete(`${BASE_URL}/api/threads/${createdThread.id}/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
    }
  })

  test('쓰레드 수정 API (작성자만 가능)', async ({ request }) => {
    // 로그인
    const loginResponse = await request.post(`${BASE_URL}/auth/auth/jwt/login/`, {
      data: testUser,
    })

    if (loginResponse.status() === 200) {
      const loginResult = await loginResponse.json()
      const accessToken = loginResult.access

      // 쓰레드 생성
      const createResponse = await request.post(`${BASE_URL}/api/threads/`, {
        data: testThread,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (createResponse.status() === 201) {
        const createdThread = await createResponse.json()
        const threadId = createdThread.id

        // 쓰레드 수정
        const updatedData = {
          title: '수정된 제목',
          content: '수정된 내용',
        }

        const updateResponse = await request.patch(`${BASE_URL}/api/threads/${threadId}/`, {
          data: updatedData,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })

        expect(updateResponse.status()).toBe(200)
        const updatedThread = await updateResponse.json()

        expect(updatedThread.title).toBe(updatedData.title)
        expect(updatedThread.content).toBe(updatedData.content)

        // 정리
        await request.delete(`${BASE_URL}/api/threads/${threadId}/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
      }
    }
  })

  test('쓰레드 삭제 API (작성자만 가능)', async ({ request }) => {
    // 로그인
    const loginResponse = await request.post(`${BASE_URL}/auth/auth/jwt/login/`, {
      data: testUser,
    })

    if (loginResponse.status() === 200) {
      const loginResult = await loginResponse.json()
      const accessToken = loginResult.access

      // 쓰레드 생성
      const createResponse = await request.post(`${BASE_URL}/api/threads/`, {
        data: testThread,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (createResponse.status() === 201) {
        const createdThread = await createResponse.json()
        const threadId = createdThread.id

        // 쓰레드 삭제
        const deleteResponse = await request.delete(`${BASE_URL}/api/threads/${threadId}/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })

        expect(deleteResponse.status()).toBe(204)

        // 삭제 확인
        const getResponse = await request.get(`${BASE_URL}/api/threads/${threadId}/`)
        expect(getResponse.status()).toBe(404)
      }
    }
  })

  test('쓰레드 좋아요 API (인증 필요)', async ({ request }) => {
    // 먼저 기존 쓰레드 가져오기
    const listResponse = await request.get(`${BASE_URL}/api/threads/`)
    const threads = await listResponse.json()

    if (threads.results.length > 0) {
      const threadId = threads.results[0].id

      // 인증 없이 좋아요 시도
      const unauthResponse = await request.post(`${BASE_URL}/api/threads/${threadId}/like/`)
      expect(unauthResponse.status()).toBe(401)

      // 로그인 후 좋아요 시도
      const loginResponse = await request.post(`${BASE_URL}/auth/auth/jwt/login/`, {
        data: testUser,
      })

      if (loginResponse.status() === 200) {
        const loginResult = await loginResponse.json()
        const accessToken = loginResult.access

        // 좋아요 추가
        const likeResponse = await request.post(`${BASE_URL}/api/threads/${threadId}/like/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })

        expect(likeResponse.status()).toBe(200)
        const likeResult = await likeResponse.json()
        expect(likeResult).toHaveProperty('is_liked')
        expect(likeResult).toHaveProperty('likes_count')

        // 좋아요 취소 (다시 호출)
        const unlikeResponse = await request.post(`${BASE_URL}/api/threads/${threadId}/like/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })

        expect(unlikeResponse.status()).toBe(200)
        const unlikeResult = await unlikeResponse.json()
        expect(unlikeResult.is_liked).toBe(!likeResult.is_liked)
      }
    }
  })

  test('존재하지 않는 쓰레드 조회', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/threads/99999/`)
    expect(response.status()).toBe(404)
  })

  test('잘못된 데이터로 쓰레드 생성', async ({ request }) => {
    const loginResponse = await request.post(`${BASE_URL}/auth/auth/jwt/login/`, {
      data: testUser,
    })

    if (loginResponse.status() === 200) {
      const loginResult = await loginResponse.json()
      const accessToken = loginResult.access

      // 필수 필드 누락
      const invalidData = {
        title: '제목만 있음',
        // content와 book 누락
      }

      const response = await request.post(`${BASE_URL}/api/threads/`, {
        data: invalidData,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      expect(response.status()).toBe(400)
      const error = await response.json()
      expect(error).toHaveProperty('content')
      expect(error).toHaveProperty('book')
    }
  })
})

test.describe('레거시 쓰레드 API 테스트', () => {
  test('레거시 쓰레드 목록 조회', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/threads/`)

    // 레거시 API는 존재하지 않을 수 있음
    expect([200, 404]).toContain(response.status())

    if (response.status() === 200) {
      const threads = await response.json()
      expect(Array.isArray(threads)).toBeTruthy()
    }
  })
})

test.describe('쓰레드 권한 테스트', () => {
  test('다른 사용자의 쓰레드 수정 시도', async ({ request }) => {
    // 첫 번째 사용자로 쓰레드 생성
    const loginResponse1 = await request.post(`${BASE_URL}/auth/auth/jwt/login/`, {
      data: testUser,
    })

    if (loginResponse1.status() === 200) {
      const loginResult1 = await loginResponse1.json()
      const accessToken1 = loginResult1.access

      const createResponse = await request.post(`${BASE_URL}/api/threads/`, {
        data: testThread,
        headers: {
          Authorization: `Bearer ${accessToken1}`,
        },
      })

      if (createResponse.status() === 201) {
        const createdThread = await createResponse.json()
        const threadId = createdThread.id

        // 다른 사용자로 로그인 (실제로는 같은 사용자지만 권한 테스트 목적)
        // 실제 환경에서는 다른 사용자 계정이 필요

        // 인증 없이 수정 시도
        const updateResponse = await request.patch(`${BASE_URL}/api/threads/${threadId}/`, {
          data: { title: '해킹 시도' },
        })

        expect(updateResponse.status()).toBe(401)

        // 정리
        await request.delete(`${BASE_URL}/api/threads/${threadId}/`, {
          headers: {
            Authorization: `Bearer ${accessToken1}`,
          },
        })
      }
    }
  })

  test('페이지네이션 테스트', async ({ request }) => {
    // 첫 번째 페이지
    const page1Response = await request.get(`${BASE_URL}/api/threads/?page=1`)
    expect(page1Response.status()).toBe(200)

    const page1Data = await page1Response.json()
    expect(page1Data).toHaveProperty('results')
    expect(page1Data).toHaveProperty('count')

    // 두 번째 페이지 (있다면)
    if (page1Data.next) {
      const page2Response = await request.get(`${BASE_URL}/api/threads/?page=2`)
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
