<template>
  <div class="shichen-container">
    <div class="title">十二时辰圆盘</div>
    <div class="circle-wrapper">
      <svg :width="size" :height="size" class="shichen-circle">
        <!-- 外圆 -->
        <circle
          :cx="center"
          :cy="center"
          :r="radius"
          fill="none"
          stroke="#4a5568"
          stroke-width="3"
        />
        
        <!-- 12个时辰的分割线和标签 -->
        <g v-for="(shichen, index) in shichens" :key="index">
          <!-- 分割线 -->
          <line
            :x1="center + (radius - 20) * Math.cos(getAngle(index))"
            :y1="center + (radius - 20) * Math.sin(getAngle(index))"
            :x2="center + radius * Math.cos(getAngle(index))"
            :y2="center + radius * Math.sin(getAngle(index))"
            stroke="#718096"
            stroke-width="2"
          />
          
          <!-- 时辰标签 -->
          <text
            :x="center + (radius - 50) * Math.cos(getAngle(index))"
            :y="center + (radius - 50) * Math.sin(getAngle(index))"
            :class="['shichen-label', { active: currentShichen === index }]"
            text-anchor="middle"
            dominant-baseline="middle"
            :font-size="fontSize"
            :fill="currentShichen === index ? '#667eea' : '#2d3748'"
            :font-weight="currentShichen === index ? 'bold' : 'normal'"
          >
            {{ shichen }}
          </text>
          
          <!-- 时辰时间范围 -->
          <text
            :x="center + (radius - 80) * Math.cos(getAngle(index))"
            :y="center + (radius - 80) * Math.sin(getAngle(index))"
            class="time-label"
            text-anchor="middle"
            dominant-baseline="middle"
            font-size="12"
            fill="#718096"
          >
            {{ getTimeRange(index) }}
          </text>
        </g>
        
        <!-- 中心点 -->
        <circle
          :cx="center"
          :cy="center"
          r="8"
          fill="#667eea"
        />
        
        <!-- 指针（指向当前时辰） -->
        <line
          v-if="currentShichen !== null"
          :x1="center"
          :y1="center"
          :x2="center + (radius - 30) * Math.cos(getAngle(currentShichen))"
          :y2="center + (radius - 30) * Math.sin(getAngle(currentShichen))"
          stroke="#667eea"
          stroke-width="4"
          stroke-linecap="round"
        />
      </svg>
    </div>
    
    <div class="info-section">
      <div class="current-info">
        <h3>当前时辰：{{ shichens[currentShichen] }}</h3>
        <p>时间范围：{{ getTimeRange(currentShichen) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const size = 600
const center = size / 2
const radius = 250
const fontSize = 24

// 十二时辰：子时在最下面（90度），顺时针排列
const shichens = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

// 时辰对应的时间范围（现代时间）
const timeRanges = [
  '23:00-01:00', // 子
  '01:00-03:00', // 丑
  '03:00-05:00', // 寅
  '05:00-07:00', // 卯
  '07:00-09:00', // 辰
  '09:00-11:00', // 巳
  '11:00-13:00', // 午
  '13:00-15:00', // 未
  '15:00-17:00', // 申
  '17:00-19:00', // 酉
  '19:00-21:00', // 戌
  '21:00-23:00'  // 亥
]

const currentShichen = ref(null)
let updateTimer = null

// 计算角度：子时在底部（90度），顺时针排列
// 每个时辰间隔30度（360/12）
const getAngle = (index) => {
  // 子时在90度（底部），顺时针排列
  // SVG坐标系：0度=右侧，90度=底部，180度=左侧，270度=顶部
  const angle = (90 + index * 30) * (Math.PI / 180)
  return angle
}

const getTimeRange = (index) => {
  return timeRanges[index] || ''
}

// 根据当前时间计算当前时辰
const updateCurrentShichen = () => {
  const now = new Date()
  const hour = now.getHours()
  
  // 根据小时判断时辰
  // 子时：23:00-01:00 (23, 0)
  // 丑时：01:00-03:00 (1, 2)
  // ...
  let shichenIndex = 0
  
  if (hour >= 23 || hour < 1) {
    shichenIndex = 0 // 子
  } else if (hour >= 1 && hour < 3) {
    shichenIndex = 1 // 丑
  } else if (hour >= 3 && hour < 5) {
    shichenIndex = 2 // 寅
  } else if (hour >= 5 && hour < 7) {
    shichenIndex = 3 // 卯
  } else if (hour >= 7 && hour < 9) {
    shichenIndex = 4 // 辰
  } else if (hour >= 9 && hour < 11) {
    shichenIndex = 5 // 巳
  } else if (hour >= 11 && hour < 13) {
    shichenIndex = 6 // 午
  } else if (hour >= 13 && hour < 15) {
    shichenIndex = 7 // 未
  } else if (hour >= 15 && hour < 17) {
    shichenIndex = 8 // 申
  } else if (hour >= 17 && hour < 19) {
    shichenIndex = 9 // 酉
  } else if (hour >= 19 && hour < 21) {
    shichenIndex = 10 // 戌
  } else if (hour >= 21 && hour < 23) {
    shichenIndex = 11 // 亥
  }
  
  currentShichen.value = shichenIndex
}

onMounted(() => {
  updateCurrentShichen()
  // 每分钟更新一次
  updateTimer = setInterval(updateCurrentShichen, 60000)
})

onUnmounted(() => {
  if (updateTimer) {
    clearInterval(updateTimer)
  }
})
</script>

<style scoped>
.shichen-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title {
  color: white;
  font-size: 2.5rem;
  font-weight: 300;
  margin-bottom: 40px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.circle-wrapper {
  background: white;
  border-radius: 50%;
  padding: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  margin-bottom: 30px;
}

.shichen-circle {
  display: block;
}

.shichen-label {
  font-family: 'Microsoft YaHei', 'SimHei', sans-serif;
  transition: all 0.3s ease;
  cursor: pointer;
}

.shichen-label:hover {
  fill: #667eea !important;
  font-weight: bold !important;
}

.shichen-label.active {
  filter: drop-shadow(0 0 4px rgba(102, 126, 234, 0.6));
}

.time-label {
  font-family: 'Microsoft YaHei', 'SimHei', sans-serif;
}

.info-section {
  background: white;
  border-radius: 12px;
  padding: 30px 50px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
  text-align: center;
}

.current-info h3 {
  margin: 0 0 10px 0;
  color: #2d3748;
  font-size: 1.8rem;
  font-weight: 600;
}

.current-info p {
  margin: 0;
  color: #718096;
  font-size: 1.2rem;
}

@media (max-width: 768px) {
  .shichen-container {
    padding: 20px 10px;
  }
  
  .title {
    font-size: 2rem;
    margin-bottom: 20px;
  }
  
  .circle-wrapper {
    transform: scale(0.7);
    margin-bottom: 20px;
  }
  
  .info-section {
    padding: 20px 30px;
  }
  
  .current-info h3 {
    font-size: 1.4rem;
  }
  
  .current-info p {
    font-size: 1rem;
  }
}
</style>

