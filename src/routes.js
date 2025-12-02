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

      // 自动生成页面标题
    const titleMap = {
      Task: '任务中心 - Elephant',
      Profile: '个人资料 - Elephant',
      Puzzle: '拼图挑战 - Elephant',
      NumberSum: '数字求和工具 - Elephant',
      // 你可以继续补充更多组件名与标题的映射
    };

    const meta = {
      requiresAuth: componentName === 'Task',
      title: titleMap[componentName] || `${componentName} - Elephant`
    };

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

   // 设置页面标题
  if (to.meta?.title) {
    document.title = to.meta.title;
  } else {
    document.title = 'Elephant';
  }

  if (to.meta.requiresAuth) {
    requireAuth(to, from, next);
  } else {
    next();
  }
});

export default router;
