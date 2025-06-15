<template>
  <div>
    <video
      ref="videoPlayer"
      class="video-js vjs-default-skin"
      controls
      preload="auto"
      width="640"
      height="360"
    ></video>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
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

onMounted(() => {
  player.value = videojs(videoPlayer.value, {
    autoplay: true,
    controls: true,
    sources: [
      {
        src: props.src,
        type: 'application/x-mpegURL'
      }
    ]
  })
})

onBeforeUnmount(() => {
  if (player.value) {
    player.value.dispose()
  }
})
</script>

<style scoped>
.video-js {
  border-radius: 10px;
}
</style>
