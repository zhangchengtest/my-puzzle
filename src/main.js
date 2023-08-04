import { createApp } from 'vue'
import './style.css'
import router from './routes' // 引入路由配置文件

import App from './App.vue'

const app = createApp(App)

const initApp = async() => {
    app.use( router )
    
    await router.isReady()
  
    app.mount( '#app' )
  }
initApp()
