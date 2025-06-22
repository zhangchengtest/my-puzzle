<script setup>
import { ref } from 'vue'
import { Swappable } from '@shopify/draggable'
import Timer from './Timer.vue'
import Loading from './Loading.vue'
import Header from './Header.vue'

const imageArray = ref([])             // 当前拼图数组（打乱后的）
const originalImageArray = ref([])     // 原始正确顺序数组（上传完成时备份）
const timer = ref()
const isStart = ref(false)
const step = ref(0)
const loadingVisible = ref(false)
const swappable = ref()

// resizeImage 改为返回 Promise，确保图片加载完成
function resizeImage(image, width, height) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(image, 0, 0, width, height)
    const resized = new Image()
    resized.onload = () => resolve(resized)
    resized.src = canvas.toDataURL()
  })
}

async function handleImageUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = async (e) => {
    const img = new Image()
    img.onload = async () => {
      const maxWidth = 300
      let scale = 1
      if (img.width > maxWidth) {
        scale = maxWidth / img.width
      }
      const scaledWidth = img.width * scale
      const scaledHeight = img.height * scale

      const resizedImage = await resizeImage(img, scaledWidth, scaledHeight)
      const pieces = splitImage(resizedImage, 3, scaledWidth, scaledHeight)

      originalImageArray.value = pieces.slice() // 备份正确顺序
      imageArray.value = pieces

      step.value = 0
      isStart.value = false
      timer.value?.reset()
      stopswap()
    }
    img.src = e.target.result
  }
  reader.readAsDataURL(file)
}

function splitImage(image, gridSize, totalWidth, totalHeight) {
  const pieceWidth = totalWidth / gridSize
  const pieceHeight = totalHeight / gridSize
  const pieces = []
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  canvas.width = pieceWidth
  canvas.height = pieceHeight

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      ctx.clearRect(0, 0, pieceWidth, pieceHeight)
      ctx.drawImage(
        image,
        x * pieceWidth,
        y * pieceHeight,
        pieceWidth,
        pieceHeight,
        0,
        0,
        pieceWidth,
        pieceHeight
      )
      pieces.push(canvas.toDataURL())
    }
  }
  return pieces
}

// 洗牌算法 - 打乱数组
function shuffleArray(arr) {
  const newArr = arr.slice()
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArr[i], newArr[j]] = [newArr[j], newArr[i]]
  }
  return newArr
}

function startGame() {
  if (imageArray.value.length !== 9) return

  // 打乱拼图顺序
  imageArray.value = shuffleArray(imageArray.value)

  timer.value?.start()
  isStart.value = true
  step.value = 0
  swap()
}

function stopswap() {
  swappable.value?.destroy()
}

// 初始化拖拽交换
function swap() {
  stopswap()
  swappable.value = new Swappable(document.querySelectorAll('.puzzle-all'), {
    draggable: 'img',
    delay: 0,
    mirror: { constrainDimensions: true },
  })
  swappable.value.on('drag:stop', () => {
    move()
  })
}

// 每次拖拽完成调用
function move() {
  if (!isStart.value) return
  step.value++
  checkComplete()
}

// 检测拼图是否完成
function checkComplete() {
  const currentOrder = Array.from(document.querySelectorAll('.puzzle-all img')).map(img => img.src)

  const completed = currentOrder.every((src, index) => src === originalImageArray.value[index])

  if (completed) {
    isStart.value = false
    timer.value?.stop?.() // 如果 timer 组件没有 stop 方法，需实现或改用 reset
    stopswap()
    alert('恭喜你，拼图完成！')
  }
}

function refresh() {
  imageArray.value = []
  originalImageArray.value = []
  step.value = 0
  isStart.value = false
  timer.value?.reset()
  stopswap()
}
</script>

<template>
  <div>
    <Header :visible="loadingVisible" />

    <div style="width: 300px; margin: 0 auto; user-select: none;">
      <div style="margin-bottom: 10px;">
        <input type="file" @change="handleImageUpload" accept="image/*" />
      </div>

      <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
        <div class="time-style">
          <Timer ref="timer" />
        </div>
        <div class="step-style">步数：{{ step }}</div>
      </div>

      <div class="puzzle-all">
        <div v-for="(image, index) in imageArray" :key="index" class="child">
          <img :src="image" class="puzzle-image" draggable="true" />
        </div>
      </div>

      <div style="display: flex; justify-content: center; margin-top: 10px;">
        <div
          class="start-button"
          @click="startGame"
          v-show="!isStart && imageArray.length === 9"
          title="开始游戏"
        >
          ▶
        </div>
        <div
          class="start-button"
          @click="refresh"
          v-show="imageArray.length > 0"
          title="重置游戏"
          style="margin-left: 20px; background-color: #f88;"
        >
          ↻
        </div>
      </div>
    </div>

    <Loading :visible="loadingVisible" />
  </div>
</template>

<style scoped>
.time-style,
.step-style {
  border-radius: 5px;
  background-color: lightblue;
  padding: 5px 10px;
  user-select: none;
}

.puzzle-all {
  display: flex;
  flex-wrap: wrap;
  width: 300px; /* 固定拼图区域宽度 */
  margin: 0 auto;
  gap: 0;
}

.child {
  width: calc(100% / 3); /* 三等分宽度 */
  box-sizing: border-box;
  user-select: none;
  line-height: 0; /* 去除图片下方空白 */
}

.puzzle-image {
  display: block; /* 避免图片底部空白 */
  width: 100%; /* 图片宽度填满块 */
  height: auto; /* 保持比例 */
  user-select: none;
  cursor: grab;
}

.start-button {
  background-color: lightblue;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  font-weight: bold;
  font-size: 24px;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
</style>
