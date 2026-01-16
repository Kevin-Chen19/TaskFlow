import { createRouter, createWebHistory } from 'vue-router'
import routesConfig from "./config";
import Home from '../pages/main/main.vue'

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

export default router
