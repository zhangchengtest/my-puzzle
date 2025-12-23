<template>
  <div class="decay-board">
    <div class="container">
      <h1 class="title">状态衰减面板</h1>
      <p class="subtitle">Decay Board - 不触碰就会慢慢消失</p>
      
      <div class="items-container">
        <div
          v-for="(item, index) in items"
          :key="item.id"
          class="decay-item"
          :style="{ opacity: item.opacity }"
          @mouseenter="resetDecayOnly(index)"
          @click="resetDecayAndLRU(index)"
        >
          <div class="item-content">
            <div class="item-header">
              <div class="item-title-section">
                <span class="item-title">内容位 {{ item.id }}</span>
                <span class="item-lru" :class="{ 'lru-recent': item.lruRank === 1, 'lru-old': item.lruRank >= 4 }">
                  LRU: #{{ item.lruRank }}
                </span>
              </div>
              <div class="item-meta">
                <span class="item-ttl" :class="{ 'ttl-warning': item.ttl < 3, 'ttl-danger': item.ttl < 1 }">
                  TTL: {{ formatTTL(item.ttl) }}
                </span>
                <span class="item-time">{{ formatTime(item.lastTouch) }}</span>
              </div>
            </div>
            <div class="item-body">
              <p>{{ item.content }}</p>
            </div>
          </div>
          
          <!-- 衰减条 -->
          <div class="decay-bar-container">
            <div 
              class="decay-bar"
              :style="{ width: `${item.opacity * 100}%` }"
            ></div>
          </div>
        </div>
      </div>
      
      <div class="info-section">
        <p class="info-text">💡 提示：鼠标悬停可重置衰减，点击可重置衰减并更新LRU（点击后最近使用的会移到最前面）</p>
        <p class="info-text-small">LRU #1 = 最近使用 | LRU #5 = 最久未使用（将被优先淘汰）</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// 衰减配置
const DECAY_DURATION = 10000 // 10秒完全衰减
const DECAY_INTERVAL = 50 // 每50ms更新一次
const INITIAL_OPACITY = 1.0 // 初始透明度

// 5条内容位
const items = ref([])

let decayTimer = null

// 仅重置衰减（悬停时使用，不移动位置，避免抖动）
const resetDecayOnly = (index) => {
  const item = items.value[index]
  item.opacity = INITIAL_OPACITY
  item.lastTouch = Date.now()
  item.ttl = DECAY_DURATION / 1000
  // 更新LRU排名但不移动位置
  updateLRURank()
}

// 重置衰减并更新LRU（点击时使用，会移动位置）
const resetDecayAndLRU = (index) => {
  const item = items.value[index]
  item.opacity = INITIAL_OPACITY
  item.lastTouch = Date.now()
  item.ttl = DECAY_DURATION / 1000
  
  // LRU更新：将该项目移到数组最前面（最近使用）
  items.value.splice(index, 1)
  items.value.unshift(item)
  
  // 更新所有项目的LRU排名
  updateLRURank()
}

// 更新LRU排名
const updateLRURank = () => {
  // 按最后触碰时间排序（最近的在前面）
  const sorted = [...items.value].sort((a, b) => b.lastTouch - a.lastTouch)
  
  // 为每个项目分配LRU排名
  items.value.forEach(item => {
    const rank = sorted.findIndex(sortedItem => sortedItem.id === item.id) + 1
    item.lruRank = rank
  })
}

// 初始化项目数据
const initItems = () => {
  const now = Date.now()
  const items = [
    { id: 1, content: '这是第一条内容，如果你不触碰它，它会慢慢变淡直到消失。', opacity: INITIAL_OPACITY, lastTouch: now, ttl: DECAY_DURATION / 1000, lruRank: 1 },
    { id: 2, content: '第二条内容也在等待你的关注，时间会带走一切。', opacity: INITIAL_OPACITY, lastTouch: now - 100, ttl: DECAY_DURATION / 1000, lruRank: 2 },
    { id: 3, content: '第三条内容提醒你：重要的东西需要持续关注才能保留。', opacity: INITIAL_OPACITY, lastTouch: now - 200, ttl: DECAY_DURATION / 1000, lruRank: 3 },
    { id: 4, content: '第四条内容展示了时间的流逝，不触碰就会消失。', opacity: INITIAL_OPACITY, lastTouch: now - 300, ttl: DECAY_DURATION / 1000, lruRank: 4 },
    { id: 5, content: '最后一条内容，记住：想留住它，你必须重新触碰它。', opacity: INITIAL_OPACITY, lastTouch: now - 400, ttl: DECAY_DURATION / 1000, lruRank: 5 }
  ]
  // 按LRU排序（最近使用的在最前面）
  return items.sort((a, b) => b.lastTouch - a.lastTouch)
}

// 更新衰减
const updateDecay = () => {
  const now = Date.now()
  
  // 从后往前遍历，避免删除元素时索引问题
  for (let i = items.value.length - 1; i >= 0; i--) {
    const item = items.value[i]
    const timeSinceTouch = now - item.lastTouch
    
    if (timeSinceTouch >= DECAY_DURATION) {
      // 完全衰减，移除该项（LRU淘汰）
      items.value.splice(i, 1)
    } else {
      // 计算当前透明度
      item.opacity = Math.max(0, 1 - (timeSinceTouch / DECAY_DURATION))
      // 更新TTL（剩余生存时间，单位：秒）
      item.ttl = Math.max(0, (DECAY_DURATION - timeSinceTouch) / 1000)
    }
  }
  
  // 更新LRU排名
  updateLRURank()
  
  // 如果所有项都消失了，重新初始化
  if (items.value.length === 0) {
    items.value = initItems()
  }
}

// 格式化时间
const formatTime = (timestamp) => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) {
    return `${seconds}秒前`
  } else if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}分钟前`
  } else {
    return `${Math.floor(seconds / 3600)}小时前`
  }
}

// 格式化TTL（保留1位小数）
const formatTTL = (ttl) => {
  if (ttl <= 0) return '0.0s'
  return `${ttl.toFixed(1)}s`
}

onMounted(() => {
  items.value = initItems()
  updateLRURank()
  decayTimer = setInterval(updateDecay, DECAY_INTERVAL)
})

onUnmounted(() => {
  if (decayTimer) {
    clearInterval(decayTimer)
  }
})
</script>

<style scoped>
.decay-board {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.title {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  margin: 0;
  padding: 30px;
  text-align: center;
  font-size: 2.5rem;
  font-weight: 300;
}

.subtitle {
  text-align: center;
  color: #666;
  margin: 10px 0 30px 0;
  font-size: 1.1rem;
}

.items-container {
  padding: 30px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.decay-item {
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.decay-item:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
  transform: translateY(-2px);
}

.item-content {
  position: relative;
  z-index: 1;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.item-title-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.item-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
}

.item-lru {
  font-size: 0.85rem;
  font-weight: 600;
  color: #6c757d;
  font-family: 'Courier New', monospace;
  padding: 2px 8px;
  background: rgba(108, 117, 125, 0.1);
  border-radius: 4px;
  transition: all 0.3s ease;
}

.item-lru.lru-recent {
  color: #28a745;
  background: rgba(40, 167, 69, 0.1);
  font-weight: 700;
}

.item-lru.lru-old {
  color: #dc3545;
  background: rgba(220, 53, 69, 0.1);
}

.item-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.item-ttl {
  font-size: 1rem;
  font-weight: 600;
  color: #667eea;
  font-family: 'Courier New', monospace;
  padding: 2px 8px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 4px;
  transition: all 0.3s ease;
}

.item-ttl.ttl-warning {
  color: #ff9800;
  background: rgba(255, 152, 0, 0.1);
  animation: pulse 1s ease-in-out infinite;
}

.item-ttl.ttl-danger {
  color: #f44336;
  background: rgba(244, 67, 54, 0.1);
  animation: pulse 0.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.item-time {
  font-size: 0.85rem;
  color: #6c757d;
}

.item-body {
  color: #495057;
  line-height: 1.6;
  font-size: 1rem;
}

/* 衰减条 */
.decay-bar-container {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: #e9ecef;
  overflow: hidden;
}

.decay-bar {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.1s linear;
  box-shadow: 0 0 4px rgba(102, 126, 234, 0.5);
}

.info-section {
  padding: 20px 30px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  text-align: center;
}

.info-text {
  color: #6c757d;
  font-size: 0.95rem;
  margin: 0 0 8px 0;
}

.info-text-small {
  color: #adb5bd;
  font-size: 0.85rem;
  margin: 0;
}

@media (max-width: 768px) {
  .decay-board {
    padding: 10px;
  }
  
  .title {
    font-size: 2rem;
    padding: 20px;
  }
  
  .items-container {
    padding: 20px;
    gap: 15px;
  }
  
  .decay-item {
    padding: 15px;
  }
  
  .item-title {
    font-size: 1rem;
  }
  
  .item-body {
    font-size: 0.9rem;
  }
}
</style>
