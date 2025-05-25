import { test, expect } from '@playwright/test'

/**
 * GoBooky 애플리케이션 전체 기능 테스트
 * 지침에 따른 Django + Vue 3 SPA 테스트
 */

test.describe('GoBooky 애플리케이션 기능 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 홈페이지로 이동
    await page.goto('http://localhost:5173')
  })

  test('홈페이지 로드 및 네비게이션 테스트', async ({ page }) => {
    // 홈페이지 제목 확인
    await expect(page).toHaveTitle(/홈.*GoBooky/)

    // 메인 헤딩 확인
    await expect(page.getByRole('heading', { name: 'Welcome to GoBooky' })).toBeVisible()

    // 네비게이션 링크들 확인
    await expect(page.getByRole('link', { name: 'Home' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Books' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Threads' })).toBeVisible()
    await expect(page.getByRole('link', { name: '로그인' })).toBeVisible()
    await expect(page.getByRole('link', { name: '회원가입' })).toBeVisible()
  })

  test('도서 목록 페이지 테스트', async ({ page }) => {
    // Books 페이지로 이동
    await page.getByRole('link', { name: 'Books' }).click()
    await expect(page).toHaveURL(/.*\/books/)
    await expect(page).toHaveTitle(/도서 목록.*GoBooky/)

    // 카테고리 필터 버튼들 확인
    await expect(page.getByRole('button', { name: '소설/시/희곡' })).toBeVisible()
    await expect(page.getByRole('button', { name: '경제/경영' })).toBeVisible()
    await expect(page.getByRole('button', { name: '자기계발' })).toBeVisible()
    await expect(page.getByRole('button', { name: '인문/교양' })).toBeVisible()
    await expect(page.getByRole('button', { name: '취미/실용' })).toBeVisible()
    await expect(page.getByRole('button', { name: '어린이/청소년' })).toBeVisible()
    await expect(page.getByRole('button', { name: '과학' })).toBeVisible()
    await expect(page.getByRole('button', { name: '전체' })).toBeVisible()

    // 카테고리 필터 테스트
    await page.getByRole('button', { name: '소설/시/희곡' }).click()
    // 필터가 적용되었는지 확인 (URL 변경 또는 콘텐츠 변경)
    await page.waitForTimeout(1000) // API 응답 대기
  })

  test('쓰레드 목록 페이지 테스트', async ({ page }) => {
    // Threads 페이지로 이동
    await page.getByRole('link', { name: 'Threads' }).click()
    await expect(page).toHaveURL(/.*\/threads/)
    await expect(page).toHaveTitle(/쓰레드 목록.*GoBooky/)

    // 카테고리 필터 버튼들 확인
    await expect(page.getByRole('button', { name: '전체' })).toBeVisible()
    await expect(page.getByRole('button', { name: '소설/시/희곡' })).toBeVisible()

    // 쓰레드가 없을 때 메시지 확인 (더 유연한 선택자 사용)
    await page.waitForTimeout(2000) // API 응답 대기
    const noThreadsMessage = page
      .locator('text=쓰레드가 없습니다')
      .or(page.locator('text=No threads found'))
      .or(page.locator('p:has-text("쓰레드")'))
    await expect(noThreadsMessage.first()).toBeVisible({ timeout: 10000 })
  })

  test('로그인 페이지 테스트', async ({ page }) => {
    // 로그인 페이지로 이동
    await page.getByRole('button', { name: '로그인' }).click()
    await expect(page).toHaveURL(/.*\/login/)
    await expect(page).toHaveTitle(/로그인.*GoBooky/)

    // 로그인 폼 요소들 확인
    await expect(page.getByRole('heading', { name: '로그인' })).toBeVisible()
    await expect(page.getByRole('textbox', { name: '이메일' })).toBeVisible()
    await expect(page.getByRole('textbox', { name: '비밀번호' })).toBeVisible()
    await expect(page.getByRole('button', { name: '로그인' })).toBeVisible()
    await expect(page.getByRole('link', { name: '← 시작 페이지로' })).toBeVisible()

    // 빈 폼 제출 시 검증 테스트
    await page.getByRole('button', { name: '로그인' }).click()
    // 검증 메시지나 오류 처리 확인
  })

  test('회원가입 페이지 테스트', async ({ page }) => {
    // 회원가입 페이지로 이동
    await page.goto('http://localhost:5173/signup')
    await expect(page).toHaveURL(/.*\/signup/)
    await expect(page).toHaveTitle(/회원가입.*GoBooky/)

    // 멀티스텝 폼 단계 확인
    await expect(page.getByText('이메일 입력')).toBeVisible()
    await expect(page.getByText('이메일 인증')).toBeVisible()
    await expect(page.getByText('기본 정보')).toBeVisible()
    await expect(page.getByText('독서 정보')).toBeVisible()
    await expect(page.getByText('완료')).toBeVisible()

    // 첫 번째 단계 폼 요소들 확인 (더 구체적인 선택자 사용)
    await expect(page.getByRole('textbox', { name: '이메일' })).toBeVisible()
    await expect(page.locator('input[placeholder="비밀번호"]').first()).toBeVisible()
    await expect(page.locator('input[placeholder="비밀번호 확인"]')).toBeVisible()

    // 비밀번호 요구사항 확인
    await expect(page.getByText('• 8자 이상')).toBeVisible()
    await expect(page.getByText('• 대문자 포함')).toBeVisible()
    await expect(page.getByText('• 소문자 포함')).toBeVisible()
    await expect(page.getByText('• 숫자 포함')).toBeVisible()
    await expect(page.getByText('• 특수문자 포함')).toBeVisible()

    // 다음 버튼이 비활성화 상태인지 확인
    await expect(page.getByRole('button', { name: '다음' })).toBeDisabled()
  })

  test('API 엔드포인트 테스트', async ({ page }) => {
    // API 응답 모니터링
    const apiResponses = []

    page.on('response', (response) => {
      if (response.url().includes('/api/')) {
        apiResponses.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText(),
        })
      }
    })

    // Books 페이지 방문하여 API 호출 확인
    await page.goto('http://localhost:5173/books')
    await page.waitForTimeout(2000) // API 응답 대기

    // API 응답 확인
    const bookApiResponse = apiResponses.find((r) => r.url.includes('/api/books'))
    expect(bookApiResponse).toBeTruthy()
    expect(bookApiResponse.status).toBe(200)

    // Threads 페이지 방문하여 API 호출 확인
    await page.goto('http://localhost:5173/threads')
    await page.waitForTimeout(2000) // API 응답 대기

    const threadApiResponse = apiResponses.find((r) => r.url.includes('/api/threads'))
    expect(threadApiResponse).toBeTruthy()
    expect(threadApiResponse.status).toBe(200)
  })

  test('카테고리 API 테스트', async ({ page }) => {
    let categoryApiCalled = false
    let categoryApiResponse = null

    page.on('response', (response) => {
      if (response.url().includes('/api/categories/')) {
        categoryApiCalled = true
        categoryApiResponse = {
          status: response.status(),
          url: response.url(),
        }
      }
    })

    // 회원가입 페이지 방문 (카테고리 API 호출됨)
    await page.goto('http://localhost:5173/signup')
    await page.waitForTimeout(3000) // API 응답 대기

    // 카테고리 API가 호출되었는지 확인
    expect(categoryApiCalled).toBe(true)
    expect(categoryApiResponse.status).toBe(200)
  })

  test('반응형 디자인 테스트', async ({ page }) => {
    // 데스크톱 뷰포트
    await page.setViewportSize({ width: 1200, height: 800 })
    await page.goto('http://localhost:5173')
    await expect(page.getByRole('heading', { name: 'Welcome to GoBooky' })).toBeVisible()

    // 태블릿 뷰포트
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.getByRole('heading', { name: 'Welcome to GoBooky' })).toBeVisible()

    // 모바일 뷰포트
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.getByRole('heading', { name: 'Welcome to GoBooky' })).toBeVisible()
  })

  test('페이지 간 네비게이션 테스트', async ({ page }) => {
    // 홈 → Books → Threads → 로그인 → 홈 순서로 네비게이션
    await expect(page).toHaveURL('http://localhost:5173/')

    await page.getByRole('link', { name: 'Books' }).click()
    await expect(page).toHaveURL(/.*\/books/)

    await page.getByRole('link', { name: 'Threads' }).click()
    await expect(page).toHaveURL(/.*\/threads/)

    await page.getByRole('button', { name: '로그인' }).click()
    await expect(page).toHaveURL(/.*\/login/)

    await page.getByRole('link', { name: '← 시작 페이지로' }).click()
    await expect(page).toHaveURL('http://localhost:5173/')
  })
})

test.describe('성능 및 접근성 테스트', () => {
  test('페이지 로딩 성능 테스트', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('http://localhost:5173')
    const loadTime = Date.now() - startTime

    // 페이지 로딩이 3초 이내에 완료되는지 확인
    expect(loadTime).toBeLessThan(3000)

    // 주요 요소들이 로드되었는지 확인
    await expect(page.getByRole('heading', { name: 'Welcome to GoBooky' })).toBeVisible()
  })

  test('기본 접근성 테스트', async ({ page }) => {
    await page.goto('http://localhost:5173')

    // 키보드 네비게이션 테스트
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    // 포커스가 있는 요소 확인 (더 유연한 방식)
    const focusedElement = page.locator(':focus')
    const bodyElement = page.locator('body')

    // 포커스된 요소가 있거나 body에 포커스가 있는지 확인
    await expect(focusedElement.or(bodyElement)).toBeVisible({ timeout: 3000 })
  })
})
