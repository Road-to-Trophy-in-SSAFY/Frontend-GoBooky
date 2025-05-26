/**
 * GoBooky API Selenium 테스트
 * - 브라우저를 통한 실제 API 호출 테스트
 * - 프론트엔드와 백엔드 통합 테스트
 */

import { Builder, By, until, Key } from 'selenium-webdriver'
import chrome from 'selenium-webdriver/chrome.js'
import assert from 'assert'
import { describe, it, before, after } from 'mocha'

const FRONTEND_URL = 'http://localhost:5173'
const TEST_TIMEOUT = 30000

describe('GoBooky API Selenium 테스트', function () {
  this.timeout(TEST_TIMEOUT)

  let driver

  before(async function () {
    // Chrome 옵션 설정
    const options = new chrome.Options()
    options.addArguments('--headless') // 헤드리스 모드
    options.addArguments('--no-sandbox')
    options.addArguments('--disable-dev-shm-usage')
    options.addArguments('--disable-gpu')
    options.addArguments('--window-size=1920,1080')

    driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build()
  })

  after(async function () {
    if (driver) {
      await driver.quit()
    }
  })

  describe('홈페이지 API 호출 테스트', function () {
    it('홈페이지 로드 시 도서 목록 API 호출 확인', async function () {
      await driver.get(FRONTEND_URL)

      // 페이지 로드 대기
      await driver.wait(until.titleContains('GoBooky'), 10000)

      // 도서 목록이 로드될 때까지 대기
      await driver.wait(
        until.elementLocated(By.css('[data-testid="book-list"], .book-item, .book-card')),
        10000,
      )

      // 네트워크 로그 확인 (개발자 도구 필요)
      const logs = await driver.manage().logs().get('browser')
      console.log('브라우저 로그:', logs.length, '개')

      // 페이지 제목 확인
      const title = await driver.getTitle()
      assert(title.includes('GoBooky'), '페이지 제목이 올바르지 않습니다')
    })

    it('카테고리 필터링 기능 테스트', async function () {
      await driver.get(FRONTEND_URL)

      // 카테고리 버튼이 로드될 때까지 대기
      try {
        await driver.wait(
          until.elementLocated(
            By.css('[data-testid="category-filter"], .category-button, .filter-button'),
          ),
          10000,
        )

        // 첫 번째 카테고리 버튼 클릭
        const categoryButtons = await driver.findElements(
          By.css('[data-testid="category-filter"], .category-button, .filter-button'),
        )

        if (categoryButtons.length > 0) {
          await categoryButtons[0].click()

          // 필터링된 결과 로드 대기
          await driver.sleep(2000)

          console.log('카테고리 필터링 테스트 완료')
        } else {
          console.log('카테고리 버튼을 찾을 수 없습니다')
        }
      } catch (error) {
        console.log('카테고리 필터링 요소를 찾을 수 없습니다:', error.message)
      }
    })
  })

  describe('로그인 API 테스트', function () {
    it('로그인 페이지 접근 및 API 호출', async function () {
      await driver.get(`${FRONTEND_URL}/login`)

      // 로그인 폼이 로드될 때까지 대기
      await driver.wait(
        until.elementLocated(By.css('input[type="email"], input[name="email"], #email')),
        10000,
      )

      // 이메일 입력
      const emailInput = await driver.findElement(
        By.css('input[type="email"], input[name="email"], #email'),
      )
      await emailInput.sendKeys('test@example.com')

      // 비밀번호 입력
      const passwordInput = await driver.findElement(
        By.css('input[type="password"], input[name="password"], #password'),
      )
      await passwordInput.sendKeys('testpassword')

      // 로그인 버튼 클릭
      const loginButton = await driver.findElement(
        By.css('button[type="submit"], .login-button, .btn-login'),
      )
      await loginButton.click()

      // 응답 대기 (성공 또는 실패)
      await driver.sleep(3000)

      // 현재 URL 확인
      const currentUrl = await driver.getCurrentUrl()
      console.log('로그인 후 URL:', currentUrl)

      // 에러 메시지 또는 성공 메시지 확인
      try {
        const errorMessage = await driver.findElement(
          By.css('.error-message, .alert-danger, .text-red-500'),
        )
        const errorText = await errorMessage.getText()
        console.log('로그인 에러 메시지:', errorText)
      } catch (error) {
        console.log('에러 메시지 없음 - 로그인 성공 가능성')
      }
    })

    it('잘못된 로그인 정보로 API 호출', async function () {
      await driver.get(`${FRONTEND_URL}/login`)

      // 로그인 폼 대기
      await driver.wait(
        until.elementLocated(By.css('input[type="email"], input[name="email"], #email')),
        10000,
      )

      // 잘못된 정보 입력
      const emailInput = await driver.findElement(
        By.css('input[type="email"], input[name="email"], #email'),
      )
      await emailInput.clear()
      await emailInput.sendKeys('wrong@example.com')

      const passwordInput = await driver.findElement(
        By.css('input[type="password"], input[name="password"], #password'),
      )
      await passwordInput.clear()
      await passwordInput.sendKeys('wrongpassword')

      // 로그인 시도
      const loginButton = await driver.findElement(
        By.css('button[type="submit"], .login-button, .btn-login'),
      )
      await loginButton.click()

      // 에러 메시지 확인
      await driver.wait(
        until.elementLocated(By.css('.error-message, .alert-danger, .text-red-500')),
        10000,
      )

      const errorMessage = await driver.findElement(
        By.css('.error-message, .alert-danger, .text-red-500'),
      )
      const errorText = await errorMessage.getText()

      assert(errorText.length > 0, '에러 메시지가 표시되어야 합니다')
      console.log('예상된 에러 메시지:', errorText)
    })
  })

  describe('회원가입 API 테스트', function () {
    it('회원가입 페이지 접근 및 폼 테스트', async function () {
      await driver.get(`${FRONTEND_URL}/register`)

      // 회원가입 폼 대기
      await driver.wait(
        until.elementLocated(By.css('input[type="email"], input[name="email"], #email')),
        10000,
      )

      // 고유한 이메일 생성
      const uniqueEmail = `test_${Date.now()}@example.com`
      const uniqueUsername = `testuser_${Date.now()}`

      // 폼 입력
      const emailInput = await driver.findElement(
        By.css('input[type="email"], input[name="email"], #email'),
      )
      await emailInput.sendKeys(uniqueEmail)

      try {
        const usernameInput = await driver.findElement(By.css('input[name="username"], #username'))
        await usernameInput.sendKeys(uniqueUsername)
      } catch (error) {
        console.log('사용자명 입력 필드를 찾을 수 없습니다')
      }

      const passwordInput = await driver.findElement(
        By.css('input[type="password"], input[name="password"], #password'),
      )
      await passwordInput.sendKeys('testpassword123')

      try {
        const firstNameInput = await driver.findElement(
          By.css('input[name="first_name"], input[name="firstName"], #firstName'),
        )
        await firstNameInput.sendKeys('테스트')

        const lastNameInput = await driver.findElement(
          By.css('input[name="last_name"], input[name="lastName"], #lastName'),
        )
        await lastNameInput.sendKeys('사용자')
      } catch (error) {
        console.log('이름 입력 필드를 찾을 수 없습니다')
      }

      // 회원가입 버튼 클릭
      const registerButton = await driver.findElement(
        By.css('button[type="submit"], .register-button, .btn-register'),
      )
      await registerButton.click()

      // 응답 대기
      await driver.sleep(5000)

      // 결과 확인
      const currentUrl = await driver.getCurrentUrl()
      console.log('회원가입 후 URL:', currentUrl)

      // 성공 메시지 또는 에러 메시지 확인
      try {
        const message = await driver.findElement(By.css('.success-message, .error-message, .alert'))
        const messageText = await message.getText()
        console.log('회원가입 결과 메시지:', messageText)
      } catch (error) {
        console.log('결과 메시지를 찾을 수 없습니다')
      }
    })
  })

  describe('도서 상세 페이지 API 테스트', function () {
    it('도서 상세 페이지 접근 및 API 호출', async function () {
      await driver.get(FRONTEND_URL)

      // 도서 목록 로드 대기
      await driver.wait(
        until.elementLocated(By.css('[data-testid="book-item"], .book-item, .book-card')),
        10000,
      )

      // 첫 번째 도서 클릭
      try {
        const bookItems = await driver.findElements(
          By.css('[data-testid="book-item"], .book-item, .book-card'),
        )

        if (bookItems.length > 0) {
          await bookItems[0].click()

          // 상세 페이지 로드 대기
          await driver.sleep(3000)

          const currentUrl = await driver.getCurrentUrl()
          console.log('도서 상세 페이지 URL:', currentUrl)

          // 도서 정보가 로드되었는지 확인
          try {
            await driver.wait(until.elementLocated(By.css('.book-title, .book-info, h1')), 10000)
            console.log('도서 상세 정보 로드 완료')
          } catch (error) {
            console.log('도서 상세 정보 로드 실패')
          }
        } else {
          console.log('도서 아이템을 찾을 수 없습니다')
        }
      } catch (error) {
        console.log('도서 클릭 실패:', error.message)
      }
    })
  })

  describe('쓰레드 관련 API 테스트', function () {
    it('쓰레드 목록 페이지 접근', async function () {
      await driver.get(`${FRONTEND_URL}/threads`)

      // 쓰레드 목록 로드 대기
      try {
        await driver.wait(
          until.elementLocated(By.css('[data-testid="thread-list"], .thread-item, .thread-card')),
          10000,
        )
        console.log('쓰레드 목록 로드 완료')

        // 쓰레드 개수 확인
        const threadItems = await driver.findElements(
          By.css('[data-testid="thread-item"], .thread-item, .thread-card'),
        )
        console.log('로드된 쓰레드 개수:', threadItems.length)
      } catch (error) {
        console.log('쓰레드 목록을 찾을 수 없습니다:', error.message)
      }
    })

    it('쓰레드 생성 페이지 접근 (로그인 필요)', async function () {
      await driver.get(`${FRONTEND_URL}/threads/create`)

      // 로그인 페이지로 리다이렉트되는지 확인
      await driver.sleep(2000)

      const currentUrl = await driver.getCurrentUrl()
      console.log('쓰레드 생성 페이지 접근 후 URL:', currentUrl)

      if (currentUrl.includes('/login')) {
        console.log('로그인이 필요한 페이지로 올바르게 리다이렉트됨')
      } else {
        console.log('쓰레드 생성 페이지에 접근함 (이미 로그인된 상태일 수 있음)')
      }
    })
  })

  describe('네트워크 에러 처리 테스트', function () {
    it('네트워크 연결 없이 API 호출 시뮬레이션', async function () {
      // 실제 네트워크 차단은 어려우므로 존재하지 않는 엔드포인트 호출
      await driver.get(FRONTEND_URL)

      // 개발자 도구에서 네트워크 에러 확인
      await driver.executeScript(`
        fetch('/api/nonexistent-endpoint')
          .catch(error => {
            console.log('예상된 네트워크 에러:', error.message);
            window.testNetworkError = error.message;
          });
      `)

      await driver.sleep(2000)

      // 에러 처리 확인
      const errorResult = await driver.executeScript('return window.testNetworkError')
      console.log('네트워크 에러 처리 결과:', errorResult)
    })
  })

  describe('반응형 디자인 API 테스트', function () {
    it('모바일 화면에서 API 호출 테스트', async function () {
      // 모바일 화면 크기로 변경
      await driver.manage().window().setRect({ width: 375, height: 667 })

      await driver.get(FRONTEND_URL)

      // 모바일에서도 API 호출이 정상적으로 작동하는지 확인
      await driver.wait(until.elementLocated(By.css('body')), 10000)

      // 화면 크기 확인
      const windowSize = await driver.manage().window().getRect()
      console.log('현재 화면 크기:', windowSize)

      // 모바일 메뉴 또는 네비게이션 확인
      try {
        const mobileMenu = await driver.findElement(
          By.css('.mobile-menu, .hamburger, .menu-toggle'),
        )
        console.log('모바일 메뉴 발견')
      } catch (error) {
        console.log('모바일 메뉴를 찾을 수 없습니다')
      }

      // 화면 크기 복원
      await driver.manage().window().setRect({ width: 1920, height: 1080 })
    })
  })
})
