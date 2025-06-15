<template>
  <div>
    <video
      ref="videoPlayer"
      class="video-js vjs-default-skin"
      controls
      preload="auto"
      playsinline
    ></video>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'

const props = defineProps({
  src: {
    type: String,
    required: true
  }
})

const player = ref(null)
const videoPlayer = ref(null)

onMounted(async () => {
  await nextTick()

  if (!videoPlayer.value) {
    console.warn('视频元素尚未加载')
    return
  }

  // 初始化 video.js 播放器
  player.value = videojs(videoPlayer.value, {
    autoplay: true,
    muted: true, // 兼容自动播放策略
    controls: true,
    preload: 'auto',
    sources: [
      {
        src: props.src,
        type: 'application/x-mpegURL'
      }
    ]
  })

  // 防止某些平台初始化后不自动播放
  player.value.ready(() => {
    player.value.play().catch((err) => {
      console.warn('自动播放失败：', err)
    })
  })
})

// 监听播放源变化，切换视频
watch(() => props.src, (newSrc) => {
  if (player.value && newSrc) {
    player.value.src({ src: newSrc, type: 'application/x-mpegURL' })
    player.value.play().catch((err) => {
      console.warn('播放切换失败：', err)
    })
  }
})

// 组件卸载时释放资源
onBeforeUnmount(() => {
  if (player.value) {
    player.value.dispose()
    player.value = null
  }
})
</script>

<style scoped>
.video-js {
  border-radius: 10px;
}

.video {
  width: 100%;
  height: auto;
  background: black;
  border-radius: 8px;
}
</style>
