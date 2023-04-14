import Puzzle from './Puzzle.vue'
import Callback from './Callback.vue'
import Novel from './Novel.vue'
import Timeline from './Timeline.vue'

export default [
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
    path: '/callback',
    name: 'Callback',
    component: Callback
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
  }
]
