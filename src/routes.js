import { createRouter, createWebHistory } from 'vue-router';
import { requireAuth } from './auth';

// 动态加载所有 .vue 文件
const modules = import.meta.glob('./pages/*.vue');

const routes = [
  // 自动生成的路由
  ...Object.keys(modules).map(fileName => {
    // 获取组件名（去除路径和扩展名）
    const componentName = fileName.replace(/^\.\//, '').replace(/\.\w+$/, '').replace("pages", '').replace(/\/+/, '');

    // 生成路由的路径
    const path = `/${componentName.toLowerCase()}`;

    // 如果是 Task 页面，需要身份验证
    const meta = componentName === 'Task' ? { requiresAuth: true } : {};

    return {
      path: path,
      name: componentName,
      component: modules[fileName], // 使用动态导入
      meta: meta,
    };
  }),

  // 特殊的路由配置，可以手动添加
  {
    path: '/',
    name: 'Index',
    component: () => import('./Index.vue')
  }
];

const router = createRouter({
  history: createWebHistory('/mix'),
  routes
});

// 添加全局前置守卫
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    requireAuth(to, from, next);
  } else {
    next();
  }
});

export default router;
