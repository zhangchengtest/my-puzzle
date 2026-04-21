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
      <div class="tangent-side" title="切线在击球方向的左侧或右侧（相对前进方向）">
        <span class="tangent-side-label">切线</span>
        <div class="seg">
          <button type="button" class="seg-btn" :class="{ on: tangentSide === 'left' }" @click="tangentSide = 'left'">
            左
          </button>
          <button type="button" class="seg-btn" :class="{ on: tangentSide === 'right' }" @click="tangentSide = 'right'">
            右
          </button>
        </div>
      </div>
      <button type="button" :class="{ active: editMode === 'cue' }" @click="toggleEditMode('cue')">
        {{ editMode === 'cue' ? '取消移动白球' : '移动白球' }}
      </button>
      <button
        type="button"
        :class="{ active: editMode === 'target' }"
        @click="toggleEditMode('target')"
      >
        {{ editMode === 'target' ? '取消移动目标球' : '移动目标球' }}
      </button>
      <div class="color-spots" title="把目标球放到斯诺克彩球标准点位（台面坐标）">
        <span class="color-spots-label">目标落点</span>
        <div class="color-spots-row">
          <button
            v-for="s in snookerColorSpots"
            :key="s.id"
            type="button"
            class="color-spot-btn"
            @click="snapTargetToSpot(s)"
          >
            {{ s.short }}
          </button>
        </div>
      </div>
      <div class="cue-nudge" title="每次平移 5 像素（台面坐标）">
        <span class="cue-nudge-label">白球微调</span>
        <div class="cue-nudge-grid">
          <span class="cue-nudge-spacer" />
          <button type="button" class="cue-nudge-btn" aria-label="白球上移" @click="nudgeCue(0, -1)">↑</button>
          <span class="cue-nudge-spacer" />
          <button type="button" class="cue-nudge-btn" aria-label="白球左移" @click="nudgeCue(-1, 0)">←</button>
          <span class="cue-nudge-center" />
          <button type="button" class="cue-nudge-btn" aria-label="白球右移" @click="nudgeCue(1, 0)">→</button>
          <span class="cue-nudge-spacer" />
          <button type="button" class="cue-nudge-btn" aria-label="白球下移" @click="nudgeCue(0, 1)">↓</button>
          <span class="cue-nudge-spacer" />
        </div>
      </div>
      <div class="aim-nudge" title="每次旋转 0.5° 微调瞄准线（无需拖拽）">
        <span class="cue-nudge-label">瞄准微调</span>
        <div class="seg">
          <button type="button" class="seg-btn" aria-label="瞄准线左旋" @click="nudgeAim(-1)">左旋</button>
          <button type="button" class="seg-btn" aria-label="瞄准线右旋" @click="nudgeAim(1)">右旋</button>
        </div>
      </div>
      <span v-if="showHint && lineVisibility.hintAngleArc" class="angle-tip">
        提示夹角：{{ cueTargetPocketAngleDeg.toFixed(1) }}°
      </span>
      <span class="result" aria-live="polite">{{ resultText }}</span>
    </div>

    <div class="overlay-panel">
      <div class="overlay-title">辅助线显示</div>
      <div class="overlay-grid">
        <label v-for="item in overlayLineItems" :key="item.key" class="overlay-item">
          <input v-model="lineVisibility[item.key]" type="checkbox" />
          <span class="overlay-name">{{ item.label }}</span>
        </label>
      </div>
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
const CUE_NUDGE_STEP = 5
const AIM_NUDGE_DEG = 0.5

const baulkLineX = PAD + (W - PAD * 2) * 0.22

const snookerColorSpots = (() => {
  const centerY = H / 2
  return [
    { id: 'yellow', short: '黄', label: '黄球点', x: baulkLineX, y: centerY - 65 },
    { id: 'brown', short: '棕', label: '棕球点', x: baulkLineX, y: centerY },
    { id: 'green', short: '绿', label: '绿球点', x: baulkLineX, y: centerY + 65 },
    { id: 'blue', short: '蓝', label: '蓝球点', x: W / 2, y: centerY },
    { id: 'pink', short: '粉', label: '粉球点', x: W * 0.66, y: centerY },
    { id: 'black', short: '黑', label: '黑球点', x: W - PAD - 95, y: centerY },
  ]
})()

// 简化关卡：白球 -> 目标球 -> 目标球需要沿 cue->target 方向进入指定球袋
const cueBall = ref({ x: 304, y: 158 })
const targetBall = ref({ x: 550, y: 200 })
const requiredPocket = ref({ x: W - PAD, y: PAD }) // 默认右上袋，可点击袋口切换

const state = ref({
  aiming: false,
  hasAim: false,
  aimDir: { x: 1, y: 0 }, // 归一化
  aimEnd: { x: cueBall.value.x + 200, y: cueBall.value.y }, // 画线用
})

const showHint = ref(false)
const resultText = ref('点击白球附近开始瞄准')
const editMode = ref('none')
const tangentSide = ref('left')

const defaultLineVisibility = {
  userAimLine: true,
  userTangentLine: true,
  hintAimLine: true,
  hintTangentLine: true,
  hintPocketLine: true,
  hintGhostBall: true,
  hintAngleArc: true,
}

const lineVisibility = ref({ ...defaultLineVisibility })

const overlayLineItems = [
  { key: 'userAimLine', label: '我的瞄准线（拖拽）' },
  { key: 'userTangentLine', label: '我的切线（与瞄准线平行、切母球）' },
  { key: 'hintAimLine', label: '提示：进球瞄准线（幽灵球）' },
  { key: 'hintTangentLine', label: '提示：切线（与进球瞄准线平行、切母球）' },
  { key: 'hintPocketLine', label: '提示：进袋方向线（过幽灵球）' },
  { key: 'hintGhostBall', label: '提示：幽灵球标记' },
  { key: 'hintAngleArc', label: '提示：夹角弧线（幽灵球处）' },
]

const requiredTargetToPocketDir = computed(() => normalize(sub(requiredPocket.value, targetBall.value)))
const requiredGhostPoint = computed(() => {
  const d = requiredTargetToPocketDir.value
  return {
    x: targetBall.value.x - d.x * BALL_R * 2,
    y: targetBall.value.y - d.y * BALL_R * 2,
  }
})
const requiredCueShotDir = computed(() => normalize(sub(requiredGhostPoint.value, cueBall.value)))
const cueTargetPocketAngleDeg = computed(() => {
  const ghost = requiredGhostPoint.value
  const cue = cueBall.value
  const target = targetBall.value
  // 在幽灵球中心读夹角：入射 母球→幽灵球；另一侧沿进袋直线取 幽灵球→目标球（与 目标球→袋口 共线）
  const incoming = normalize(sub(ghost, cue))
  const alongPotLine = normalize(sub(target, ghost))
  const cos = clamp(dot(incoming, alongPotLine), -1, 1)
  return (Math.acos(cos) * 180) / Math.PI
})

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

function wrapPi(angle) {
  // wrap to (-pi, pi]
  let a = angle
  while (a <= -Math.PI) a += Math.PI * 2
  while (a > Math.PI) a -= Math.PI * 2
  return a
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

  const point = getCanvasPoint(clientX, clientY)
  if (!point) return
  const { x: px, y: py } = point

  const cue = cueBall.value
  const rawDir = normalize({ x: px - cue.x, y: py - cue.y })
  if (!Number.isFinite(rawDir.x) || !Number.isFinite(rawDir.y)) return

  const t = rayBoxIntersectionT(cue, rawDir)
  const aimEnd = t ? { x: cue.x + rawDir.x * t, y: cue.y + rawDir.y * t } : { x: px, y: py }

  state.value.aimDir = rawDir
  state.value.aimEnd = aimEnd
}

function checkAim() {
  const userDir = normalize(state.value.aimDir)
  const requiredDir = requiredCueShotDir.value
  const cue = cueBall.value

  // 1) 击球线是否经过幽灵球点（标准进球瞄准）
  const t = rayBoxIntersectionT(cue, userDir)
  const segLen = t ?? 0
  const hitGhost = rayIntersectsCircleSegment(cue, userDir, segLen, requiredGhostPoint.value, BALL_R * 0.8)

  // 2) 线路方向是否与“母球正确出击方向”对齐
  const ok = hitGhost && angleOk(userDir, requiredDir)

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

  // 斯诺克六彩球点位标记（仅展示标准点位）
  for (const c of getSnookerColorBalls()) {
    drawBall(c, c.fill, c.highlight, c.label)
  }

  // 目标球
  drawBall(targetBall.value, '#e85d5d', '#ffb1b1', '目标球')

  // 白球
  drawBall(cueBall.value, '#f5f5f5', '#bcbcbc', '白球')

  // 画你自己的瞄准线（拖拽后保留）
  if (state.value.aiming || state.value.hasAim) {
    const cue = cueBall.value
    const userDir = state.value.aimDir
    const userT = rayBoxIntersectionT(cue, userDir)
    if (userT && lineVisibility.value.userAimLine) {
      const userEnd = { x: cue.x + userDir.x * userT, y: cue.y + userDir.y * userT }
      ctx.save()
      ctx.setLineDash([10, 8])
      ctx.lineWidth = 3
      ctx.strokeStyle = '#4db6ff'
      ctx.beginPath()
      ctx.moveTo(cue.x, cue.y)
      ctx.lineTo(userEnd.x, userEnd.y)
      ctx.stroke()
      ctx.restore()
    }

    // 用户瞄准线的切线辅助线（与拖拽方向平行、与母球相切）
    if (userT && lineVisibility.value.userTangentLine) {
      drawCueParallelTangentThroughTarget(ctx, cue, targetBall.value, userDir, tangentSide.value, {
        dash: [2, 5],
        stroke: 'rgba(125, 200, 255, 0.9)',
      })
    }
  }

  // 画提示线（和用户线并存）
  if (showHint.value) {
    const cue = cueBall.value
    const target = targetBall.value
    const ghost = requiredGhostPoint.value

    // A. 母球击球线（主提示线）
    const cueDir = requiredCueShotDir.value
    const cueT = rayBoxIntersectionT(cue, cueDir)
    if (cueT && lineVisibility.value.hintAimLine) {
      const cueEnd = { x: cue.x + cueDir.x * cueT, y: cue.y + cueDir.y * cueT }
      ctx.save()
      ctx.setLineDash([8, 6])
      ctx.lineWidth = 2
      ctx.strokeStyle = '#c084fc'
      ctx.beginPath()
      ctx.moveTo(cue.x, cue.y)
      ctx.lineTo(cueEnd.x, cueEnd.y)
      ctx.stroke()
      ctx.restore()
    }

    // A2. 切线辅助线：与击球线平行，与母球相切，且（在法向意义上）经过目标球
    if (cueT && lineVisibility.value.hintTangentLine) {
      drawCueParallelTangentThroughTarget(ctx, cue, target, cueDir, tangentSide.value, {
        dash: [1, 5],
        stroke: 'rgba(125, 240, 212, 0.85)',
      })
    }

    // B. 进袋方向线：穿过幽灵球中心，与进球瞄准线在该点相交（目标球→袋口 所在直线）
    if (lineVisibility.value.hintPocketLine) {
      const pocketDir = requiredTargetToPocketDir.value
      const tBack = rayBoxIntersectionT(ghost, { x: -pocketDir.x, y: -pocketDir.y })
      const tFwd = rayBoxIntersectionT(ghost, pocketDir)
      ctx.save()
      ctx.setLineDash([2, 6])
      ctx.lineWidth = 2
      ctx.strokeStyle = 'rgba(255, 209, 102, 0.55)'
      ctx.beginPath()
      ctx.moveTo(ghost.x, ghost.y)
      if (tFwd) {
        const fwdEnd = { x: ghost.x + pocketDir.x * tFwd, y: ghost.y + pocketDir.y * tFwd }
        ctx.lineTo(fwdEnd.x, fwdEnd.y)
      }
      ctx.moveTo(ghost.x, ghost.y)
      if (tBack) {
        const backEnd = { x: ghost.x - pocketDir.x * tBack, y: ghost.y - pocketDir.y * tBack }
        ctx.lineTo(backEnd.x, backEnd.y)
      }
      ctx.stroke()
      ctx.restore()
    }

    // C. 幽灵球点（画在线之上，便于看到“交于幽灵球中心”）
    if (lineVisibility.value.hintGhostBall) {
      ctx.save()
      ctx.fillStyle = 'rgba(255, 209, 102, 0.25)'
      ctx.strokeStyle = 'rgba(255, 209, 102, 0.9)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(ghost.x, ghost.y, BALL_R, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
      ctx.restore()
    }

    // D. 台面夹角：在幽灵球中心，入射瞄准线 vs 出射进袋线
    if (lineVisibility.value.hintAngleArc) {
      drawGhostPottingAngleOnTable(ctx, ghost, cue, target, cueTargetPocketAngleDeg.value)
    }
  }
}

function drawCueParallelTangentThroughTarget(ctx, cue, target, shotDir, side, style) {
  const d = shotDir
  const nLeft = { x: -d.y, y: d.x }
  const n = side === 'right' ? { x: d.y, y: -d.x } : nLeft
  const h = dot(n, sub(target, cue)) // 目标球相对击球线的有向距离（带符号）
  const t = BALL_R - h
  const p0 = { x: target.x + n.x * t, y: target.y + n.y * t }

  const tPos = rayBoxIntersectionT(p0, d)
  const tNeg = rayBoxIntersectionT(p0, { x: -d.x, y: -d.y })
  if (!tPos || !tNeg) return

  const a = { x: p0.x - d.x * tNeg, y: p0.y - d.y * tNeg }
  const b = { x: p0.x + d.x * tPos, y: p0.y + d.y * tPos }

  ctx.save()
  ctx.setLineDash(style?.dash ?? [1, 5])
  ctx.lineWidth = 2
  ctx.strokeStyle = style?.stroke ?? 'rgba(125, 240, 212, 0.85)'
  ctx.beginPath()
  ctx.moveTo(a.x, a.y)
  ctx.lineTo(b.x, b.y)
  ctx.stroke()
  ctx.restore()
}

function drawGhostPottingAngleOnTable(ctx, ghost, cue, target, angleDeg) {
  const incoming = normalize(sub(ghost, cue))
  const outgoing = normalize(sub(target, ghost))
  const a0 = Math.atan2(incoming.y, incoming.x)
  const a1 = Math.atan2(outgoing.y, outgoing.x)
  const delta = wrapPi(a1 - a0)
  const absDelta = Math.abs(delta)

  // Canvas 的 arc 默认走“小角/大角”取决于逆时针参数；这里强制走最短角，保证弧线落在两线夹角内侧
  const anticlockwise = delta > 0
  const start = a0
  const end = anticlockwise ? a0 + absDelta : a0 - absDelta

  const arcR = BALL_R + 10

  ctx.save()
  ctx.setLineDash([])
  ctx.lineWidth = 2
  ctx.strokeStyle = 'rgba(255, 209, 102, 0.95)'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)'
  ctx.beginPath()
  ctx.arc(ghost.x, ghost.y, arcR, start, end, anticlockwise)
  ctx.stroke()

  const bisLen = Math.hypot(incoming.x + outgoing.x, incoming.y + outgoing.y)
  const bis =
    bisLen > 1e-6
      ? { x: (incoming.x + outgoing.x) / bisLen, y: (incoming.y + outgoing.y) / bisLen }
      : { x: -incoming.y, y: incoming.x }
  const labelR = arcR + 18
  const lx = ghost.x + bis.x * labelR
  const ly = ghost.y + bis.y * labelR

  ctx.font = 'bold 13px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.strokeStyle = 'rgba(0,0,0,0.55)'
  ctx.lineWidth = 3
  const text = `${angleDeg.toFixed(1)}°`
  ctx.strokeText(text, lx, ly)
  ctx.fillText(text, lx, ly)
  ctx.restore()
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
  const selectedPocket = requiredPocket.value
  const leftX = PAD
  const rightX = W - PAD
  const topY = PAD
  const bottomY = H - PAD

  // 斯诺克球桌：上方 3 袋 + 下方 3 袋（共 6 袋）
  const pockets = [
    { x: leftX, y: topY, kind: 'corner' },
    { x: rightX, y: topY, kind: 'corner' },
    { x: leftX, y: bottomY, kind: 'corner' },
    { x: rightX, y: bottomY, kind: 'corner' },
    { x: W / 2, y: topY, kind: 'mid' },
    { x: W / 2, y: bottomY, kind: 'mid' },
  ]

  // 标记目标球袋
  return pockets.map((p) => {
    const isTarget =
      Math.abs(p.x - selectedPocket.x) < 1e-6 && Math.abs(p.y - selectedPocket.y) < 1e-6
    return { ...p, kind: isTarget ? 'target' : p.kind }
  })
}

function getSnookerColorBalls() {
  return [
    { x: snookerColorSpots[0].x, y: snookerColorSpots[0].y, fill: '#f0d43a', highlight: '#fff3ad', label: '黄' },
    { x: snookerColorSpots[1].x, y: snookerColorSpots[1].y, fill: '#7e4d2a', highlight: '#c49a76', label: '棕' },
    { x: snookerColorSpots[2].x, y: snookerColorSpots[2].y, fill: '#3bb35d', highlight: '#b8f0c9', label: '绿' },
    { x: snookerColorSpots[3].x, y: snookerColorSpots[3].y, fill: '#3d7be0', highlight: '#b8d1ff', label: '蓝' },
    { x: snookerColorSpots[4].x, y: snookerColorSpots[4].y, fill: '#e57db2', highlight: '#ffd3ea', label: '粉' },
    { x: snookerColorSpots[5].x, y: snookerColorSpots[5].y, fill: '#1f1f1f', highlight: '#767676', label: '黑' },
  ]
}

function pickPocket(point) {
  const pockets = getPockets()
  const hit = pockets.find((p) => dist2(point, p) <= POCKET_R * POCKET_R * 1.2)
  if (!hit) return false
  requiredPocket.value = { x: hit.x, y: hit.y }
  state.value.hasAim = false
  state.value.aiming = false
  state.value.aimDir = requiredCueShotDir.value
  resultText.value = '目标袋口已切换，继续瞄准'
  return true
}

function onPointerDown(e) {
  const point = getCanvasPoint(e.clientX, e.clientY)
  if (!point) return

  if (editMode.value === 'none' && pickPocket(point)) {
    return
  }

  if (editMode.value !== 'none') {
    placeBall(point.x, point.y, editMode.value)
    return
  }

  // 只允许点击白球附近开始
  if (dist2(point, cueBall.value) > (BALL_R * 1.6) * (BALL_R * 1.6)) return

  state.value.aiming = true
  resultText.value = '保持拖拽，松手检查线路'
  updateAimFromPointer(e.clientX, e.clientY)
}

function onPointerMove(e) {
  if (!state.value.aiming) return
  state.value.hasAim = true
  updateAimFromPointer(e.clientX, e.clientY)
}

function onPointerUp() {
  if (!state.value.aiming) return
  state.value.aiming = false
  state.value.hasAim = true
  checkAim()
}

function reset() {
  state.value.aiming = false
  state.value.hasAim = false
  editMode.value = 'none'
  cueBall.value = { x: 304, y: 158 }
  targetBall.value = { x: 550, y: 200 }
  state.value.aimDir = requiredCueShotDir.value
  requiredPocket.value = { x: W - PAD, y: PAD }
  const cue = cueBall.value
  const t = rayBoxIntersectionT(cue, state.value.aimDir)
  state.value.aimEnd = t ? { x: cue.x + state.value.aimDir.x * t, y: cue.y + state.value.aimDir.y * t } : { x: cue.x + 200, y: cue.y }
  resultText.value = '点击白球附近开始瞄准'
  showHint.value = false
  tangentSide.value = 'left'
  lineVisibility.value = { ...defaultLineVisibility }
  nextTick(() => draw())
}

function getCanvasPoint(clientX, clientY) {
  const canvas = canvasRef.value
  if (!canvas) return null
  const rect = canvas.getBoundingClientRect()
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  }
}

function clampToTable(x, y) {
  return {
    x: clamp(x, PAD + BALL_R, W - PAD - BALL_R),
    y: clamp(y, PAD + BALL_R, H - PAD - BALL_R),
  }
}

function randomBallPos() {
  return {
    x: PAD + BALL_R + Math.random() * (W - PAD * 2 - BALL_R * 2),
    y: PAD + BALL_R + Math.random() * (H - PAD * 2 - BALL_R * 2),
  }
}

function randomizeBallsForNewPage() {
  cueBall.value = randomBallPos()
  targetBall.value = randomBallPos()
  let guard = 0
  // 避免两球太近导致初始视图重叠难操作
  while (dist2(cueBall.value, targetBall.value) < (BALL_R * 6) * (BALL_R * 6) && guard < 50) {
    targetBall.value = randomBallPos()
    guard += 1
  }
  state.value.aimDir = requiredCueShotDir.value
}

function placeBall(x, y, mode) {
  const pos = clampToTable(x, y)
  if (mode === 'cue') {
    cueBall.value = pos
    resultText.value = '白球位置已更新'
  } else if (mode === 'target') {
    targetBall.value = pos
    resultText.value = '目标球位置已更新'
  }
  state.value.hasAim = false
  state.value.aiming = false
  state.value.aimDir = requiredCueShotDir.value
}

function nudgeCue(dx, dy) {
  const c = cueBall.value
  const nx = c.x + dx * CUE_NUDGE_STEP
  const ny = c.y + dy * CUE_NUDGE_STEP
  cueBall.value = clampToTable(nx, ny)
  state.value.hasAim = false
  state.value.aiming = false
  state.value.aimDir = requiredCueShotDir.value
  editMode.value = 'none'
  resultText.value = `白球已平移（步长 ${CUE_NUDGE_STEP}px）`
}

function nudgeAim(direction) {
  const dir = normalize(state.value.aimDir)
  const rad = ((AIM_NUDGE_DEG * Math.PI) / 180) * direction
  const c = Math.cos(rad)
  const si = Math.sin(rad)
  const rotated = normalize({
    x: dir.x * c - dir.y * si,
    y: dir.x * si + dir.y * c,
  })

  state.value.aimDir = rotated
  state.value.aiming = false
  state.value.hasAim = true
  editMode.value = 'none'
  resultText.value = `瞄准线已微调 ${AIM_NUDGE_DEG}°`
}

function snapTargetToSpot(spot) {
  targetBall.value = clampToTable(spot.x, spot.y)
  state.value.hasAim = false
  state.value.aiming = false
  state.value.aimDir = requiredCueShotDir.value
  editMode.value = 'none'
  resultText.value = `目标球已放到：${spot.label}`
}

function toggleEditMode(mode) {
  editMode.value = editMode.value === mode ? 'none' : mode
  if (editMode.value === 'cue') {
    resultText.value = '点击球桌可移动白球'
  } else if (editMode.value === 'target') {
    resultText.value = '点击球桌可移动目标球'
  } else {
    resultText.value = '点击白球附近开始瞄准'
  }
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
  state.value.aimDir = requiredCueShotDir.value

  reset()
  randomizeBallsForNewPage()

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

.active {
  border-color: #ffd166;
}

.result {
  padding-left: 8px;
  opacity: 0.95;
}

.angle-tip {
  color: #ffd166;
  font-weight: 600;
}

.cue-nudge,
.aim-nudge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
}

.cue-nudge-label {
  font-size: 12px;
  opacity: 0.85;
  line-height: 1;
}

.cue-nudge-grid {
  display: grid;
  grid-template-columns: 2.4em 2.4em 2.4em;
  grid-template-rows: 2.4em 2.4em 2.4em;
  gap: 4px;
  align-items: center;
  justify-items: center;
}

.cue-nudge-btn {
  width: 2.4em;
  height: 2.4em;
  padding: 0;
  line-height: 1;
  font-size: 16px;
}

.cue-nudge-spacer {
  width: 2.4em;
  height: 2.4em;
}

.cue-nudge-center {
  width: 2.4em;
  height: 2.4em;
}

.color-spots {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
}

.color-spots-label {
  font-size: 12px;
  opacity: 0.85;
  line-height: 1;
}

.color-spots-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
}

.color-spot-btn {
  min-width: 2.2em;
  height: 2.2em;
  padding: 0 0.35em;
  line-height: 1;
  font-size: 14px;
}

.tangent-side {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
}

.tangent-side-label {
  font-size: 12px;
  opacity: 0.85;
  line-height: 1;
}

.seg {
  display: flex;
  gap: 6px;
}

.seg-btn {
  min-width: 2.6em;
  height: 2.2em;
  padding: 0 0.45em;
  line-height: 1;
  font-size: 14px;
}

.seg-btn.on {
  border-color: rgba(125, 240, 212, 0.95);
}

.overlay-panel {
  margin-top: 12px;
  padding: 10px 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  text-align: left;
}

.overlay-title {
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 8px;
  opacity: 0.95;
}

.overlay-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(260px, 1fr));
  gap: 8px 14px;
}

@media (max-width: 720px) {
  .overlay-grid {
    grid-template-columns: 1fr;
  }
}

.overlay-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  line-height: 1.25;
  opacity: 0.95;
}

.overlay-item input {
  margin-top: 2px;
}

.overlay-name {
  text-align: left;
}
</style>

