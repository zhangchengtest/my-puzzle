<template>
  <div>
    <div v-if="!eventName">
      <input v-model="eventNameInput" class="search-input" placeholder="请输入事件名称..." />
      <button @click="confirmEventName">确认</button>
    </div>
    <div v-else>
      <div>{{ eventName }}</div>
      <div>
        <input v-model="searchText" class="search-input" placeholder="搜索标题或内容..." />
      </div>
      <ul>
        <li v-for="event in filteredEvents" :key="event.title">
          <div v-for="(article, index) in event.articles" :key="article.id">
            <div class="timeline">
              <div>
                <span class="circle" :class="getCircleClass(article.content)"></span>
                <div class="mydate">{{ article.title }}</div>
              </div>
              <div class="event">
                <span v-if="article.avatar">
                  <img :src="article.avatar" class="logo" />
                </span>
                <div class="content">
                  <p class="inner-content" v-html="processedContent(article.content)"></p>
                  <button v-if="article.url" class="jump-btn" @click="jumpTo(article.url)">跳转</button>
                </div>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import markdownToHtml from '@/utils/markdown';

export default {
  data() {
    return {
      eventName: '',
      eventNameInput: '',
      events: [],
      searchText: ''
    };
  },
  methods: {
    confirmEventName() {
      if (!this.eventNameInput) {
        alert('请输入事件名称');
        return;
      }
      this.eventName = this.eventNameInput;
      this.fetchEvents();
    },
    fetchEvents() {
      const url = `https://clock.cuiyi.club/openapi/articles/list?category=${this.eventName}&pageSize=1000`;
      axios.get(url)
        .then(response => {
          this.events = response.data.data;
        })
        .catch(error => {
          console.error(error);
        });
    },
    getCircleClass(content) {
      return content ? 'circle-black' : 'circle-red';
    },
    jumpTo(url) {
      window.open(url, '_blank');
    }
  },
  computed: {
    processedContent() {
      return (content) => {
        if (!content) return '';
        return markdownToHtml(content);
      };
    },
    filteredEvents() {
      if (!this.searchText) return this.events;
      const keyword = this.searchText.toLowerCase();
      return this.events
        .map(event => {
          const filteredArticles = event.articles.filter(article =>
            (article.title && article.title.toLowerCase().includes(keyword)) ||
            (article.content && article.content.toLowerCase().includes(keyword))
          );
          return filteredArticles.length > 0 ? { ...event, articles: filteredArticles } : null;
        })
        .filter(Boolean);
    }
  },
  created() {
    this.eventName = this.$route.query.eventName || '';
    if (this.eventName) {
      this.fetchEvents();
    }
  }
};
</script>

<style>
.inner-content {
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.logo {
  width: 16px;
  height: 16px;
  margin-bottom: -10px;
  position: absolute;
  left: -28px;
  top: 20px;
}

.timeline::before {
  content: "";
  position: absolute;
  top: 0;
  left: -20px;
  transform: translateX(-50%);
  width: 2px;
  height: 100%;
  background-color: black;
}

.timeline {
  position: relative;
  display: flex;
  flex-direction: column;
}

@media (max-width: 600px) {
  .timeline {
    width: 300px;
  }
}

.circle {
  position: absolute;
  left: -20px;
  top: 10px;
  transform: translateX(-50%);
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
}

.circle-red {
  background-color: red;
}

.circle-black {
  background-color: black;
}

.event {
  position: relative;
  display: flex;
  align-items: center;
}

.content {
  flex: 1;
  width: 280px;
  text-align: left;
}

.mydate {
  display: block;
  margin-top: 16px;
  font-size: 0.85rem;
  font-weight: bold;
  color: #999999;
  text-align: left;
}

ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.jump-btn {
  margin-top: 8px;
  padding: 4px 8px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
}

.jump-btn:hover {
  background-color: #66b1ff;
}

.search-input {
  width: 100%;
  max-width: 400px;
  padding: 8px;
  margin: 10px 0;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
