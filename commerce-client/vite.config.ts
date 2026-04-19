import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    host: '0.0.0.0', // 允许局域网访问（方便你用手机测试）
    port: 5173,      // 前端固定运行在 5173 端口
    proxy: {
      // 拦截所有以 /api 开头的请求
      '/api': {
        target: 'http://127.0.0.1:8888', // 你的 Node.js 后端服务实际运行地址
        changeOrigin: true,              // 必须为 true，允许跨域
        // 如果你的后端接口本身就带有 /api（比如 /api/user/login），就不需要 rewrite
        // rewrite: (path) => path.replace(/^\/api/, '') 
      }
    }
  }
})
