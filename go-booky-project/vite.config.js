import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages 배포를 위한 base 경로 설정
  base: '/ssafy_pjt/',
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  define: {
    // 환경 변수 정의 (프로덕션에서는 실제 API URL로 변경 필요)
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify('http://127.0.0.1:8000'),
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    proxy: {
      '/media': 'http://127.0.0.1:8000',
    },
  },
})
