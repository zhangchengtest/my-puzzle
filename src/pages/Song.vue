<template>
  <div class="container">
    <!-- 播放器 -->
    <div class="player-wrapper" v-if="currentSrc">
      <M3U8Player :key="currentSrc" :src="currentSrc" />
    </div>

    <!-- 播放源列表 -->
    <div class="source-list">
      <h3>播放源列表</h3>
      <ul>
        <li
          v-for="(item, index) in sourceList"
          :key="index"
          :class="{ active: item.url === currentSrc }"
          @click="currentSrc = item.url"
        >
          {{ item.name }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import M3U8Player from './components/M3U8Player.vue'

const sourceList = ref([])
const currentSrc = ref('')

const apiUrl = 'https://clock.cuiyi.club/openapi/media/list'

onMounted(async () => {
  try {
    const res = await axios.get(apiUrl)
    sourceList.value = res.data

    if (sourceList.value.length > 0) {
      currentSrc.value = sourceList.value[0].url
    }
  } catch (err) {
    console.error('获取播放源失败:', err)
  }
})
</script>

<style scoped>
.container {
  max-width: 100%;
  padding: 1rem;
  box-sizing: border-box;
}

/* 播放器自适应容器 */
.player-wrapper {
  position: relative;
  width: 100%;
  max-width: 100%;
  aspect-ratio: 16 / 9;
  margin-bottom: 1rem;
  background: #000;
  overflow: hidden;
  border-radius: 8px;
}

/* 播放源列表 */
.source-list {
  margin-top: 1rem;
}

.source-list h3 {
  font-size: 1.1rem;
  text-align: center;
  margin-bottom: 0.5rem;
}

.source-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
}

.source-list li {
  flex: 1 1 calc(50% - 1rem);
  min-width: 120px;
  max-width: 45%;
  padding: 0.6rem;
  text-align: center;
  background-color: #f9f9f9;
  border: 1px solid #ccc;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.source-list li.active {
  background-color: #3b82f6;
  color: white;
  font-weight: bold;
}

.source-list li:hover {
  background-color: #e0e7ff;
}

/* 移动端样式 */
@media screen and (max-width: 768px) {
  .container {
    padding: 0.5rem;
  }

  .source-list li {
    flex: 1 1 100%;
    max-width: 100%;
    font-size: 14px;
    padding: 0.5rem;
  }
}
</style>
