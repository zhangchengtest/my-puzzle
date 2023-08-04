import Puzzle from './Puzzle.vue'
import Novel from './Novel.vue'
import Timeline from './Timeline.vue'
import Upload from './Upload.vue'
import Task from './Task.vue'
import Chess from './components/Chess.vue'
import Calendar from './components/Calendar.vue'
import Card from './components/Card.vue'
import Tennis from './Tennis.vue'


import { createRouter, createWebHistory } from 'vue-router';
import { requireAuth } from './auth';

const routes = [
  {
    path: '/',
    name: 'Puzzle',
    component: Puzzle
  },
  {
    path: '/home',
    name: 'Puzzle2',
    component: Puzzle
  },
  {
    path: '/novel',
    name: 'Novel',
    component: Novel
  },
  {
    path: '/timeline',
    name: 'Timeline',
    component: Timeline
  },
  {
    path: '/upload',
    name: 'Upload',
    component: Upload
  },
  {
    path: '/xiangqi',
    name: 'xiangqi',
    component: Chess
  },
  {
    path: '/task',
    name: 'task',
    component: Task,
    meta: { requiresAuth: true } // 添加 meta 字段，标记该路由需要进行登录验
  },
  {
    path: '/tennis',
    name: 'tennis',
    component: Tennis
  },
  {
    path: '/ca',
    name: 'ca',
    component: Calendar
  },
  {
    path: '/card',
    name: 'card',
    component: Card
  }

  
]

const router = createRouter({
  history: createWebHistory('/mix'),
  routes
})

// 添加全局前置守卫
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    requireAuth(to, from, next);
  } else {
    next();
  }
});

export default router;
