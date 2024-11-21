import { createApp } from 'vue'
import './style.css'
import router from './routes' // 引入路由配置文件

import App from './App.vue'

import axios from 'axios' // 引入 Axios

const app = createApp(App)

// 将 axios 添加到 Vue 的原型中，使得组件中可以通过 this.$http 使用
app.config.globalProperties.$http = axios

const initApp = async() => {
    app.use( router )
    
    await router.isReady()
  
    app.mount( '#app' )
  }
initApp()
