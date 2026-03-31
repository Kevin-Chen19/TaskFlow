import { createRouter, createWebHistory } from 'vue-router'
import routesConfig from "./config";
import Home from '../pages/main/main.vue'
import { useLoginStore } from '@/stores/loginStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Login',
      component: () => import('../pages/login/login.vue'),
    },
    {
      path:'/home',
      name:'Home',
      component:Home
    }
  ],
})
routesConfig.forEach((item) => {
  router.addRoute("Home", item);
});

// 全局前置守卫
router.beforeEach((to, _from, next) => {
  const loginStore = useLoginStore()

  // 白名单:不需要登录的页面
  const whiteList = ['/', 'Login']

  // 检查是否在白名单中
  if (whiteList.includes(to.path) || whiteList.includes(to.name as string)) {
    // 如果已登录且访问登录页,重定向到首页
    if (loginStore.isLoggedIn && to.path === '/') {
      next('/home')
    } else {
      next()
    }
  } else {
    // 需要登录的页面
    if (loginStore.isLoggedIn) {
      // 已登录,允许访问
      next()
    } else {
      // 未登录,重定向到登录页
      next('/')
    }
  }
})

export default router
