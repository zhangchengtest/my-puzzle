import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import  { resolve } from 'path'
import alias from '@rollup/plugin-alias'
const projectRootDir = resolve(__dirname);

const buildVersion = new Date().toLocaleString('sv-SE', {
  timeZone: 'Asia/Shanghai',
  hour12: false,
}).replace(' ', '_')

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
  define: {
    __APP_VERSION__: JSON.stringify(buildVersion),
  },
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
