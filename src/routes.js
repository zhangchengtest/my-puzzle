import Puzzle from './Puzzle.vue'
import Callback from './Callback.vue'
import Novel from './Novel.vue'
import Timeline from './Timeline.vue'
import Upload from './Upload.vue'
import Task from './Task.vue'
import Chess from './components/Chess.vue'
import Calendar from './components/Calendar.vue'
import Card from './components/Card.vue'
import Tennis from './Tennis.vue'

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
    component: Task
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
