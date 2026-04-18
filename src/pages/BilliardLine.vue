<template>
  <div class="wrap">
    <h2 class="title">2D 台球判线（不击打）</h2>
    <div class="sub">
      拖拽白球附近拉出“瞄准线”，只判断线路是否能让目标球进指定球袋。
    </div>

    <div class="board-wrap" ref="boardWrapRef">
      <canvas
        ref="canvasRef"
        class="board"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
      />
    </div>

    <div class="controls">
      <button type="button" @click="reset">重置</button>
      <button type="button" @click="showHint = !showHint">
        {{ showHint ? '隐藏提示' : '显示提示' }}
      </button>
      <span class="result" aria-live="polite">{{ resultText }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

const canvasRef = ref(null)
const boardWrapRef = ref(null)
const ctxRef = ref(null)

// 逻辑坐标（画布缩放后仍会用这些坐标做几何计算）
const W = 900
const H = 500
const PAD = 60

const BALL_R = 12
const POCKET_R = 18

// 简化关卡：白球 -> 目标球 -> 目标球需要沿 cue->target 方向进入指定球袋
const cue0 = { x: 304, y: 158 }
const target0 = { x: 550, y: 200 }
const requiredPocket = { x: W - PAD, y: H / 2 } // 右中袋

const state = ref({
  aiming: false,
  aimDir: { x: 1, y: 0 }, // 归一化
  aimEnd: { x: cue0.x + 200, y: cue0.y }, // 画线用
})

const showHint = ref(false)
const resultText = ref('点击白球附近开始瞄准')

const requiredCueToTargetDir = computed(() => normalize(sub(target0, cue0)))
const requiredTargetToPocketDir = computed(() => normalize(sub(requiredPocket, target0)))

const angleToleranceDeg = 3.0
const angleToleranceRad = (angleToleranceDeg * Math.PI) / 180

let rafId = 0

function normalize(v) {
  const len = Math.hypot(v.x, v.y) || 1
  return { x: v.x / len, y: v.y / len }
}

function sub(a, b) {
  return { x: a.x - b.x, y: a.y - b.y }
}

function dot(a, b) {
  return a.x * b.x + a.y * b.y
}

function crossAbs(a, b) {
  return Math.abs(a.x * b.y - a.y * b.x)
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}

function dist2(a, b) {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return dx * dx + dy * dy
}

function rayBoxIntersectionT(origin, dir) {
  // 将射线与桌面内边界（PAD~W-PAD / PAD~H-PAD）求交，返回最小正 t
  const minX = PAD
  const maxX = W - PAD
  const minY = PAD
  const maxY = H - PAD

  const eps = 1e-9
  let tmin = -Infinity
  let tmax = Infinity

  if (Math.abs(dir.x) < eps) {
    if (origin.x < minX || origin.x > maxX) return null
  } else {
    const tx1 = (minX - origin.x) / dir.x
    const tx2 = (maxX - origin.x) / dir.x
    tmin = Math.max(tmin, Math.min(tx1, tx2))
    tmax = Math.min(tmax, Math.max(tx1, tx2))
  }

  if (Math.abs(dir.y) < eps) {
    if (origin.y < minY || origin.y > maxY) return null
  } else {
    const ty1 = (minY - origin.y) / dir.y
    const ty2 = (maxY - origin.y) / dir.y
    tmin = Math.max(tmin, Math.min(ty1, ty2))
    tmax = Math.min(tmax, Math.max(ty1, ty2))
  }

  if (tmax < 0) return null
  const t = tmin >= 0 ? tmin : tmax
  return Number.isFinite(t) ? t : null
}

function rayIntersectsCircleSegment(origin, dir, segLen, circleCenter, circleRadius) {
  // 计算“射线（0~segLen）”到圆的最短距离
  const toC = sub(circleCenter, origin)
  const t = dot(toC, dir)
  if (t < 0 || t > segLen) return false

  const closest = { x: origin.x + dir.x * t, y: origin.y + dir.y * t }
  return dist2(closest, circleCenter) <= circleRadius * circleRadius
}

function angleOk(userDir, requiredDir) {
  // userDir 和 requiredDir 都是单位向量
  const cos = clamp(dot(userDir, requiredDir), -1, 1)
  return Math.acos(cos) <= angleToleranceRad
}

function updateAimFromPointer(clientX, clientY) {
  const canvas = canvasRef.value
  const ctx = ctxRef.value
  if (!canvas || !ctx) return

  const rect = canvas.getBoundingClientRect()
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height

  const px = (clientX - rect.left) * scaleX
  const py = (clientY - rect.top) * scaleY

  const rawDir = normalize({ x: px - cue0.x, y: py - cue0.y })
  if (!Number.isFinite(rawDir.x) || !Number.isFinite(rawDir.y)) return

  const t = rayBoxIntersectionT(cue0, rawDir)
  const aimEnd = t ? { x: cue0.x + rawDir.x * t, y: cue0.y + rawDir.y * t } : { x: px, y: py }

  state.value.aimDir = rawDir
  state.value.aimEnd = aimEnd
}

function checkAim() {
  const userDir = normalize(state.value.aimDir)
  const requiredDir = requiredCueToTargetDir.value

  // 1) 线路上是否真的“能撞到”目标球（简化：白球沿线射出，目标球中心距离线段 <= 球半径）
  const t = rayBoxIntersectionT(cue0, userDir)
  const segLen = t ?? 0
  const hitTarget = rayIntersectsCircleSegment(cue0, userDir, segLen, target0, BALL_R)

  // 2) 线路方向是否与“正确进袋方向”对齐（只判断角度）
  const dirOk = hitTarget && angleOk(userDir, requiredDir)

  // 3) 进一步校验：目标球走向球袋的方向也要一致（同轴即可）
  const targetDirOk = angleOk(requiredTargetToPocketDir.value, requiredCueToTargetDir.value)
  const ok = dirOk && targetDirOk

  resultText.value = ok ? '正确！目标球会进入指定球袋（判线通过）' : '不对：瞄准方向偏了，目标球进袋失败'
  return ok
}

function draw() {
  const canvas = canvasRef.value
  const ctx = ctxRef.value
  if (!canvas || !ctx) return

  // 清屏
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // 桌面背景
  ctx.fillStyle = '#0a3b2e'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // 桌面边框
  ctx.strokeStyle = '#d8c9a5'
  ctx.lineWidth = 6
  ctx.strokeRect(PAD, PAD, W - PAD * 2, H - PAD * 2)

  // 球袋（用深色圆）
  const pockets = getPockets()
  for (const p of pockets) {
    ctx.beginPath()
    ctx.fillStyle = p.kind === 'target' ? '#1f0f0f' : '#120a0a'
    ctx.arc(p.x, p.y, POCKET_R, 0, Math.PI * 2)
    ctx.fill()
  }

  // 目标球
  drawBall(target0, '#e85d5d', '#ffb1b1', '目标球')

  // 白球
  drawBall(cue0, '#f5f5f5', '#bcbcbc', '白球')

  // 画瞄准线
  const showLine = state.value.aiming || showHint.value
  if (showLine) {
    const origin = cue0
    let dir = state.value.aimDir

    if (showHint.value && !state.value.aiming) {
      dir = requiredCueToTargetDir.value
    }

    const t = rayBoxIntersectionT(origin, dir)
    if (t) {
      const end = { x: origin.x + dir.x * t, y: origin.y + dir.y * t }
      ctx.save()
      ctx.setLineDash([10, 8])
      ctx.lineWidth = 3
      ctx.strokeStyle = '#4db6ff'
      ctx.beginPath()
      ctx.moveTo(origin.x, origin.y)
      ctx.lineTo(end.x, end.y)
      ctx.stroke()
      ctx.restore()
    }
  }
}

function drawBall(center, fill, highlight, label) {
  const ctx = ctxRef.value
  if (!ctx) return

  // 阴影
  ctx.beginPath()
  ctx.fillStyle = 'rgba(0,0,0,0.25)'
  ctx.arc(center.x + 2, center.y + 4, BALL_R, 0, Math.PI * 2)
  ctx.fill()

  // 主球
  const grd = ctx.createRadialGradient(center.x - 4, center.y - 6, 2, center.x, center.y, BALL_R + 2)
  grd.addColorStop(0, highlight)
  grd.addColorStop(1, fill)

  ctx.beginPath()
  ctx.fillStyle = grd
  ctx.arc(center.x, center.y, BALL_R, 0, Math.PI * 2)
  ctx.fill()

  // 轮廓
  ctx.lineWidth = 2
  ctx.strokeStyle = 'rgba(255,255,255,0.28)'
  ctx.stroke()

  // 简单文字（避免太拥挤，仅在目标球上显示）
  if (label === '目标球') {
    ctx.fillStyle = 'rgba(0,0,0,0.35)'
    ctx.font = '12px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('T', center.x, center.y + 0.5)
  }
}

function getPockets() {
  const midY = H / 2
  const leftX = PAD
  const rightX = W - PAD
  const topY = PAD
  const bottomY = H - PAD

  const pockets = [
    { x: leftX, y: topY, kind: 'corner' },
    { x: rightX, y: topY, kind: 'corner' },
    { x: leftX, y: bottomY, kind: 'corner' },
    { x: rightX, y: bottomY, kind: 'corner' },
    { x: W / 2, y: topY, kind: 'mid' },
    { x: W / 2, y: bottomY, kind: 'mid' },
    { x: leftX, y: midY, kind: 'mid' },
    { x: rightX, y: midY, kind: 'mid' },
  ]

  // 标记目标球袋
  return pockets.map((p) => {
    const isTarget =
      Math.abs(p.x - requiredPocket.x) < 1e-6 && Math.abs(p.y - requiredPocket.y) < 1e-6
    return { ...p, kind: isTarget ? 'target' : p.kind }
  })
}

function onPointerDown(e) {
  if (!canvasRef.value) return
  // 只允许点击白球附近开始
  const rect = canvasRef.value.getBoundingClientRect()
  const scaleX = canvasRef.value.width / rect.width
  const scaleY = canvasRef.value.height / rect.height
  const px = (e.clientX - rect.left) * scaleX
  const py = (e.clientY - rect.top) * scaleY

  if (dist2({ x: px, y: py }, cue0) > (BALL_R * 1.6) * (BALL_R * 1.6)) return

  state.value.aiming = true
  resultText.value = '保持拖拽，松手检查线路'
  updateAimFromPointer(e.clientX, e.clientY)
}

function onPointerMove(e) {
  if (!state.value.aiming) return
  updateAimFromPointer(e.clientX, e.clientY)
}

function onPointerUp() {
  if (!state.value.aiming) return
  state.value.aiming = false
  checkAim()
}

function reset() {
  state.value.aiming = false
  state.value.aimDir = requiredCueToTargetDir.value
  const t = rayBoxIntersectionT(cue0, state.value.aimDir)
  state.value.aimEnd = t ? { x: cue0.x + state.value.aimDir.x * t, y: cue0.y + state.value.aimDir.y * t } : { x: cue0.x + 200, y: cue0.y }
  resultText.value = '点击白球附近开始瞄准'
  showHint.value = false
  nextTick(() => draw())
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctxRef.value = ctx

  // 初始化 aimDir
  state.value.aimDir = requiredCueToTargetDir.value

  reset()

  // 简单的动画循环：aiming 时每帧重画，否则也会在重置时画一次
  const loop = () => {
    draw()
    rafId = requestAnimationFrame(loop)
  }
  rafId = requestAnimationFrame(loop)
})

onBeforeUnmount(() => {
  if (rafId) cancelAnimationFrame(rafId)
})
</script>

<style scoped>
.wrap {
  padding: 18px;
  max-width: 980px;
  margin: 0 auto;
}

.title {
  margin: 0 0 6px;
  font-weight: 700;
}

.sub {
  opacity: 0.9;
  margin-bottom: 10px;
}

.board-wrap {
  width: min(980px, 100%);
  display: flex;
  justify-content: center;
}

.board {
  width: 100%;
  max-width: 900px;
  height: auto;
  aspect-ratio: 9 / 5;
  border-radius: 10px;
  touch-action: none;
  background: #0a3b2e;
}

.controls {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: 12px;
  flex-wrap: wrap;
}

.result {
  padding-left: 8px;
  opacity: 0.95;
}
</style>

