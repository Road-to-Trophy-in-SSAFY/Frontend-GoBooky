# GoBooky Project

Vue 3 + Django를 사용한 도서 관리 및 커뮤니티 플랫폼입니다. Context7을 통한 라이브러리 문서화 도구가 통합되어 있습니다.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Run End-to-End Tests with [Playwright](https://playwright.dev)

```sh
# Install browsers for the first run
npx playwright install

# When testing on CI, must build the project first
npm run build

# Runs the end-to-end tests
npm run test:e2e
# Runs the tests only on Chromium
npm run test:e2e -- --project=chromium
# Runs the tests of a specific file
npm run test:e2e -- tests/example.spec.ts
# Runs the tests in debug mode
npm run test:e2e -- --debug
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## Context7 통합

이 프로젝트는 Context7을 사용하여 라이브러리 문서화 및 검색 기능을 제공합니다.

### Context7 도우미 사용법

```sh
# Context7 도우미 실행 (라이브러리 정보 및 사용법 확인)
npm run context7:help

# 보안 취약점 체크 및 Context7 가이드
npm run context7:security

# Context7 통합 문서 확인
npm run docs:context7
```

### 주요 기능

- **라이브러리 문서 검색**: Vue.js, Pinia, Django 등 프로젝트에서 사용하는 라이브러리의 최신 문서 검색
- **보안 취약점 모니터링**: npm audit과 연동하여 보안 이슈 추적
- **개발 워크플로우 가이드**: Context7을 활용한 효율적인 개발 방법 제시

### 지원하는 라이브러리

**Frontend:**

- Vue 3 (Composition API, Reactivity)
- Pinia (상태 관리)
- Vue Router (라우팅)
- Vite (빌드 도구)
- Axios (HTTP 클라이언트)
- Quill (리치 텍스트 에디터)

**Backend:**

- Django (웹 프레임워크)
- Django REST Framework (API 개발)

자세한 내용은 `docs/context7-integration.md` 파일을 참조하세요.
