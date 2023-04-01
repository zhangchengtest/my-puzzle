import { createApp } from 'vue'
import './style.css'
import { createRouter, createWebHistory } from 'vue-router'
import routes from './routes' // 引入路由配置文件

import App from './App.vue'

const router = createRouter({
  history: createWebHistory(),
  routes
})

const app = createApp(App)

const initApp = async() => {
    app.use( router )
    
    await router.isReady()
  
    app.mount( '#app' )
  }
initApp()
