import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import './unifyStle.scss'
import i18n from '@/language'
import { socketService } from '@/services/socketService'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(ElementPlus)

// 应用挂载后连接Socket.io
app.mount('#app')

// 初始化Socket.io连接（延迟执行确保pinia store已就绪）
setTimeout(() => {
  socketService.connect();
}, 100);

// 请求浏览器通知权限
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}
