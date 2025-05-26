import { test, expect } from '@playwright/test'

test.describe('댓글/대댓글 기능', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인
    await page.goto('/login')
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.fill('[data-testid="password-input"]', 'testpass123')
    await page.click('[data-testid="login-button"]')

    // 쓰레드 상세 페이지로 이동
    await page.goto('/threads/1')
    await page.waitForLoadState('networkidle')
  })

  test('댓글을 작성할 수 있다', async ({ page }) => {
    // 댓글 입력
    await page.fill('[data-testid="comment-input"]', '테스트 댓글입니다.')
    await page.click('[data-testid="comment-submit"]')

    // 댓글이 표시되는지 확인
    await expect(page.locator('[data-testid="comment-item"]')).toContainText('테스트 댓글입니다.')
  })

  test('댓글을 수정할 수 있다', async ({ page }) => {
    // 기존 댓글이 있다고 가정하고 수정
    await page.click('[data-testid="comment-edit-button"]')
    await page.fill('[data-testid="comment-edit-input"]', '수정된 댓글입니다.')
    await page.click('[data-testid="comment-save-button"]')

    // 수정된 댓글이 표시되는지 확인
    await expect(page.locator('[data-testid="comment-item"]')).toContainText('수정된 댓글입니다.')
  })

  test('댓글을 삭제할 수 있다', async ({ page }) => {
    // 삭제 확인 다이얼로그 처리
    page.on('dialog', (dialog) => dialog.accept())

    await page.click('[data-testid="comment-delete-button"]')

    // 댓글이 삭제되었는지 확인
    await expect(page.locator('[data-testid="comment-item"]')).toHaveCount(0)
  })

  test('대댓글을 작성할 수 있다', async ({ page }) => {
    // 답글 버튼 클릭
    await page.click('[data-testid="reply-button"]')

    // 답글 입력
    await page.fill('[data-testid="reply-input"]', '테스트 답글입니다.')
    await page.click('[data-testid="reply-submit"]')

    // 답글이 표시되는지 확인
    await expect(page.locator('[data-testid="reply-item"]')).toContainText('테스트 답글입니다.')
  })

  test('대댓글을 수정할 수 있다', async ({ page }) => {
    // 답글 수정
    await page.click('[data-testid="reply-edit-button"]')
    await page.fill('[data-testid="reply-edit-input"]', '수정된 답글입니다.')
    await page.click('[data-testid="reply-save-button"]')

    // 수정된 답글이 표시되는지 확인
    await expect(page.locator('[data-testid="reply-item"]')).toContainText('수정된 답글입니다.')
  })

  test('대댓글을 삭제할 수 있다', async ({ page }) => {
    // 삭제 확인 다이얼로그 처리
    page.on('dialog', (dialog) => dialog.accept())

    await page.click('[data-testid="reply-delete-button"]')

    // 답글이 삭제되었는지 확인
    await expect(page.locator('[data-testid="reply-item"]')).toHaveCount(0)
  })

  test('페이지네이션이 작동한다', async ({ page }) => {
    // 페이지 하단으로 스크롤
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

    // 더 보기 버튼 클릭
    await page.click('[data-testid="load-more-comments"]')

    // 더 많은 댓글이 로드되는지 확인
    await expect(page.locator('[data-testid="comment-item"]')).toHaveCountGreaterThan(10)
  })

  test('비로그인 사용자는 댓글을 작성할 수 없다', async ({ page }) => {
    // 로그아웃
    await page.click('[data-testid="logout-button"]')
    await page.goto('/threads/1')

    // 로그인 안내 메시지가 표시되는지 확인
    await expect(page.locator('[data-testid="login-prompt"]')).toBeVisible()

    // 댓글 작성 폼이 숨겨져 있는지 확인
    await expect(page.locator('[data-testid="comment-form"]')).not.toBeVisible()
  })

  test('댓글 입력 검증이 작동한다', async ({ page }) => {
    // 빈 댓글 제출 시도
    await page.click('[data-testid="comment-submit"]')

    // 에러 메시지가 표시되는지 확인
    await expect(page.locator('[data-testid="comment-error"]')).toContainText(
      '댓글 내용을 입력해주세요',
    )

    // 너무 긴 댓글 입력
    const longComment = 'a'.repeat(1001)
    await page.fill('[data-testid="comment-input"]', longComment)
    await page.click('[data-testid="comment-submit"]')

    // 길이 제한 에러 메시지 확인
    await expect(page.locator('[data-testid="comment-error"]')).toContainText(
      '1000자 이내로 작성해주세요',
    )
  })

  test('권한이 없는 사용자는 다른 사용자의 댓글을 수정/삭제할 수 없다', async ({ page }) => {
    // 다른 사용자의 댓글에서는 수정/삭제 버튼이 보이지 않아야 함
    await expect(page.locator('[data-testid="comment-edit-button"]')).not.toBeVisible()
    await expect(page.locator('[data-testid="comment-delete-button"]')).not.toBeVisible()
  })
})
