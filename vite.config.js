import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import  { resolve } from 'path'
import alias from '@rollup/plugin-alias'
const projectRootDir = resolve(__dirname);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(),
    alias({
      entries: [
        {
          find: '@',
          replacement: resolve(projectRootDir, 'src')
        }
      ]
    })],
    base: '/',
  server: {
    proxy: {
      '/files': {
        target: 'https://clock.cuiyi.club',
        changeOrigin: true,
      },
      // 模拟电商调用 s2t OpenAPI（绕过浏览器 CORS）
      '/openapi-proxy': {
        target: 'https://s2t-openapi.infiniax.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/openapi-proxy/, ''),
      },
    },
  },
})
