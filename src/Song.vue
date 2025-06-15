<template>
  <div class="container">
    <M3U8Player v-if="currentSrc" :src="currentSrc" />

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

// 你自己的 API 地址
const apiUrl = 'https://clock.cuiyi.club/openapi/media/list'

onMounted(async () => {
  try {
    const res = await axios.get(apiUrl)
    sourceList.value = res.data

    // 默认播放第一个源
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
  padding: 1rem;
}

.source-list {
  margin-top: 1rem;
}

.source-list h3 {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.source-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.source-list li {
  padding: 0.5rem;
  border: 1px solid #ccc;
  margin-bottom: 0.5rem;
  border-radius: 5px;
  text-align: center;
  background: #f9f9f9;
  cursor: pointer;
  transition: background 0.2s;
}

.source-list li.active {
  background-color: #3b82f6;
  color: white;
  font-weight: bold;
}

.source-list li:hover {
  background-color: #e0e7ff;
}

@media screen and (max-width: 768px) {
  .container {
    padding: 0.5rem;
  }

  .source-list li {
    font-size: 14px;
    padding: 0.4rem;
  }
}
</style>
