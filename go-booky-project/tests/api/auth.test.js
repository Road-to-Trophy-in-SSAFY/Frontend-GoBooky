import { test, expect } from '@playwright/test'

/**
 * GoBooky 인증 API 테스트
 * - 회원가입, 로그인, 로그아웃
 * - JWT 토큰 관리
 * - 프로필 관리
 */

const BASE_URL = 'http://127.0.0.1:8000'
const FRONTEND_URL = 'http://localhost:5173'

// 테스트용 사용자 데이터
const testUser = {
  email: 'test@example.com',
  password: 'testpassword123',
  username: 'testuser',
  first_name: '테스트',
  last_name: '사용자',
  gender: 'M',
  weekly_read_time: 5,
  yearly_read_count: 20,
  category_ids: [1, 2],
}

test.describe('인증 API 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 페이지 초기화
    await page.goto(FRONTEND_URL)
  })

  test('카테고리 목록 조회 API', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/auth/auth/categories/`)

    expect(response.status()).toBe(200)
    const categories = await response.json()
    expect(Array.isArray(categories)).toBeTruthy()
    expect(categories.length).toBeGreaterThan(0)

    // 카테고리 구조 확인
    if (categories.length > 0) {
      expect(categories[0]).toHaveProperty('pk')
      expect(categories[0]).toHaveProperty('fields')
      expect(categories[0].fields).toHaveProperty('name')
    }
  })

  test('닉네임 중복 확인 API', async ({ request }) => {
    // 존재하지 않는 닉네임 확인
    const uniqueUsername = `unique_${Date.now()}`
    const response1 = await request.post(`${BASE_URL}/auth/auth/check-nickname/`, {
      data: { username: uniqueUsername },
    })

    expect(response1.status()).toBe(200)
    const result1 = await response1.json()
    expect(result1.available).toBe(true)

    // 잘못된 데이터로 요청
    const response2 = await request.post(`${BASE_URL}/auth/auth/check-nickname/`, {
      data: {},
    })

    expect(response2.status()).toBe(400)
  })

  test('회원가입 프로세스 API', async ({ request }) => {
    const uniqueEmail = `test_${Date.now()}@example.com`
    const uniqueUsername = `testuser_${Date.now()}`

    // 1단계: 회원가입 요청
    const registerResponse = await request.post(`${BASE_URL}/auth/auth/register/`, {
      data: {
        email: uniqueEmail,
        password: testUser.password,
        username: uniqueUsername,
        first_name: testUser.first_name,
        last_name: testUser.last_name,
        gender: testUser.gender,
        weekly_read_time: testUser.weekly_read_time,
        yearly_read_count: testUser.yearly_read_count,
        category_ids: testUser.category_ids,
      },
    })

    expect(registerResponse.status()).toBe(201)
    const registerResult = await registerResponse.json()
    expect(registerResult).toHaveProperty('uuid')
    expect(registerResult).toHaveProperty('detail')

    const uuid = registerResult.uuid

    // 2단계: 이메일 인증 확인 (GET 요청으로 인증 처리)
    const verifyResponse = await request.get(`${BASE_URL}/auth/auth/verify-email/${uuid}/`)
    expect(verifyResponse.status()).toBe(200)

    // 3단계: 이메일 인증 상태 확인 (POST 요청)
    const verifyCheckResponse = await request.post(`${BASE_URL}/auth/auth/register/verify/`, {
      data: { uuid },
    })
    expect(verifyCheckResponse.status()).toBe(200)

    // 4단계: 회원가입 완료
    const completeResponse = await request.patch(`${BASE_URL}/auth/auth/register/complete/`, {
      data: { uuid },
    })
    expect(completeResponse.status()).toBe(201)
  })

  test('JWT 로그인/로그아웃 API', async ({ request, context }) => {
    // 로그인 시도 (실제 존재하는 사용자 필요)
    const loginResponse = await request.post(`${BASE_URL}/auth/auth/jwt/login/`, {
      data: {
        email: 'admin@example.com', // 실제 존재하는 사용자
        password: 'admin123',
      },
    })

    if (loginResponse.status() === 200) {
      const loginResult = await loginResponse.json()
      expect(loginResult).toHaveProperty('access')
      expect(loginResult).toHaveProperty('user')

      const accessToken = loginResult.access

      // 인증이 필요한 API 호출 테스트
      const profileResponse = await request.get(
        `${BASE_URL}/auth/auth/profile/${loginResult.user.username}/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      )
      expect(profileResponse.status()).toBe(200)

      // 로그아웃
      const logoutResponse = await request.post(`${BASE_URL}/auth/auth/jwt/logout/`)
      // 로그아웃은 쿠키 기반이므로 상태 코드만 확인
      expect([200, 401]).toContain(logoutResponse.status())
    } else {
      console.log('로그인 실패 - 테스트용 사용자가 없습니다.')
      expect(loginResponse.status()).toBe(400)
    }
  })

  test('JWT 토큰 갱신 API', async ({ request }) => {
    // 토큰 갱신 요청 (refresh token이 쿠키에 있어야 함)
    const refreshResponse = await request.post(`${BASE_URL}/auth/auth/jwt/refresh/`)

    // 쿠키가 없으면 401, 있으면 200
    expect([200, 401]).toContain(refreshResponse.status())

    if (refreshResponse.status() === 200) {
      const refreshResult = await refreshResponse.json()
      expect(refreshResult).toHaveProperty('access')
    }
  })

  test('잘못된 로그인 정보로 API 호출', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/auth/auth/jwt/login/`, {
      data: {
        email: 'wrong@example.com',
        password: 'wrongpassword',
      },
    })

    expect(response.status()).toBe(400)
    const result = await response.json()
    expect(result).toHaveProperty('detail')
  })

  test('인증 없이 보호된 엔드포인트 접근', async ({ request }) => {
    // 인증 없이 계정 삭제 시도
    const response = await request.delete(`${BASE_URL}/auth/auth/account/`)
    expect(response.status()).toBe(401)
  })
})

test.describe('프로필 API 테스트', () => {
  test('존재하지 않는 사용자 프로필 조회', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/auth/auth/profile/nonexistentuser/`)
    expect(response.status()).toBe(404)
  })

  test('팔로우 기능 API (인증 필요)', async ({ request }) => {
    // 인증 없이 팔로우 시도
    const response = await request.post(`${BASE_URL}/auth/auth/profile/testuser/follow/`)
    expect(response.status()).toBe(401)
  })
})
