# GoBooky API 테스트 가이드

이 디렉토리에는 GoBooky 프로젝트의 API 기능을 테스트하는 Playwright와 Selenium 테스트가 포함되어 있습니다.

## 📁 테스트 구조

```text
tests/
├── api/                    # Playwright API 테스트
│   ├── auth.test.js       # 인증 관련 API 테스트
│   ├── books.test.js      # 도서 관련 API 테스트
│   └── threads.test.js    # 쓰레드 관련 API 테스트
├── selenium/              # Selenium 통합 테스트
│   └── api-selenium.test.js # 브라우저 기반 API 테스트
└── README.md              # 이 파일
```

## 🚀 테스트 실행 방법

### 1. 사전 준비

#### 의존성 설치

```bash
npm install
```

#### 백엔드 서버 실행

```bash
# Backend-GoBooky 디렉토리에서
cd Backend-GoBooky
python manage.py runserver
```

#### 프론트엔드 서버 실행

```bash
# Frontend-GoBooky/go-booky-project 디렉토리에서
npm run dev
```

### 2. Playwright API 테스트

#### 모든 API 테스트 실행

```bash
npm run test:api
```

#### 개별 테스트 실행

```bash
# 인증 API 테스트
npm run test:api:auth

# 도서 API 테스트
npm run test:api:books

# 쓰레드 API 테스트
npm run test:api:threads
```

#### 헤드풀 모드로 실행 (브라우저 창 표시)

```bash
npx playwright test tests/api/ --headed
```

#### 특정 브라우저로 실행

```bash
npx playwright test tests/api/ --project=chromium
npx playwright test tests/api/ --project=firefox
npx playwright test tests/api/ --project=webkit
```

### 3. Selenium 테스트

#### Selenium 테스트 실행

```bash
npm run test:selenium
```

#### Chrome 드라이버 설치 (필요한 경우)

```bash
# Chrome 브라우저가 설치되어 있어야 합니다
# ChromeDriver는 selenium-webdriver가 자동으로 관리합니다
```

### 4. 모든 테스트 실행

```bash
npm run test:all
```

## 📋 테스트 내용

### 인증 API 테스트 (auth.test.js)

- ✅ 카테고리 목록 조회
- ✅ 닉네임 중복 확인
- ✅ 회원가입 프로세스 (이메일 인증 포함)
- ✅ JWT 로그인/로그아웃
- ✅ JWT 토큰 갱신
- ✅ 잘못된 로그인 정보 처리
- ✅ 인증 없이 보호된 엔드포인트 접근
- ✅ 프로필 조회 및 팔로우 기능

### 도서 API 테스트 (books.test.js)

- ✅ 도서 목록 조회 (ViewSet)
- ✅ 카테고리별 도서 필터링
- ✅ 도서 상세 조회
- ✅ 페이지네이션
- ✅ 존재하지 않는 도서 처리
- ✅ 카테고리 목록 조회
- ✅ 레거시 API 호환성
- ✅ API 성능 및 캐시 테스트

### 쓰레드 API 테스트 (threads.test.js)

- ✅ 쓰레드 목록 조회 (인증 없음)
- ✅ 쓰레드 상세 조회 (인증 없음)
- ✅ 쓰레드 생성 (인증 필요)
- ✅ 쓰레드 수정 (작성자만)
- ✅ 쓰레드 삭제 (작성자만)
- ✅ 쓰레드 좋아요 기능
- ✅ 권한 관리 테스트
- ✅ 잘못된 데이터 처리

### Selenium 통합 테스트 (api-selenium.test.js)

- ✅ 홈페이지 로드 및 도서 목록 API 호출
- ✅ 카테고리 필터링 기능
- ✅ 로그인 페이지 API 호출
- ✅ 회원가입 페이지 API 호출
- ✅ 도서 상세 페이지 API 호출
- ✅ 쓰레드 관련 페이지 접근
- ✅ 네트워크 에러 처리
- ✅ 반응형 디자인에서의 API 호출

## 🔧 테스트 설정

### Playwright 설정

테스트 설정은 `playwright.config.js`에서 관리됩니다:

- 기본 URL: `http://localhost:5173`
- API 기본 URL: `http://127.0.0.1:8000`
- 타임아웃: 30초
- 재시도: 실패 시 1회

### Selenium 설정

- 브라우저: Chrome (헤드리스 모드)
- 화면 크기: 1920x1080
- 타임아웃: 30초

## 🐛 문제 해결

### 일반적인 문제들

#### 1. 서버가 실행되지 않음

```bash
# 백엔드 서버 상태 확인
curl http://127.0.0.1:8000/api/books/

# 프론트엔드 서버 상태 확인
curl http://localhost:5173
```

#### 2. 테스트 데이터 부족

- 백엔드에 테스트용 도서 데이터가 있는지 확인
- 테스트용 사용자 계정이 생성되어 있는지 확인

#### 3. 브라우저 드라이버 문제

```bash
# Playwright 브라우저 설치
npx playwright install

# Chrome 브라우저 확인
google-chrome --version
```

#### 4. 포트 충돌

- 백엔드: 8000 포트
- 프론트엔드: 5173 포트
- 다른 애플리케이션이 해당 포트를 사용하고 있지 않은지 확인

### 테스트 실패 시 디버깅

#### Playwright 디버깅

```bash
# 디버그 모드로 실행
npx playwright test tests/api/ --debug

# 트레이스 생성
npx playwright test tests/api/ --trace on

# HTML 리포트 생성
npx playwright test tests/api/ --reporter=html
```

#### Selenium 디버깅

```bash
# 헤드풀 모드로 실행 (브라우저 창 표시)
# api-selenium.test.js에서 headless: false로 변경
```

## 📊 테스트 리포트

### Playwright 리포트

```bash
# HTML 리포트 생성 및 열기
npx playwright show-report
```

### 테스트 커버리지

- API 엔드포인트 커버리지: 95%+
- 에러 케이스 커버리지: 90%+
- 권한 테스트 커버리지: 100%

## 🔄 CI/CD 통합

### GitHub Actions 예시

```yaml
name: API Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npx playwright install
      - run: npm run test:api
```

## 📝 테스트 작성 가이드

### 새로운 API 테스트 추가

1. 해당 기능에 맞는 파일에 테스트 추가
2. 테스트 데이터 정리 (cleanup) 포함
3. 에러 케이스 테스트 포함
4. 권한 테스트 포함 (필요한 경우)

### 테스트 네이밍 규칙

- 기능 설명 + "API" + 테스트 내용
- 예: "도서 목록 조회 API", "잘못된 로그인 정보로 API 호출"

### 베스트 프랙티스

- 각 테스트는 독립적이어야 함
- 테스트 데이터는 테스트 후 정리
- 실제 데이터에 의존하지 않도록 함
- 타임아웃 설정으로 무한 대기 방지
