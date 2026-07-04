<template>
  <div class="career-page">
    <h1 class="page-title">求职准备</h1>

    <nav class="tabs">
      <button
        :class="['tab-btn', { active: tab === 'resume' }]"
        @click="tab = 'resume'"
      >简历</button>
      <button
        :class="['tab-btn', { active: tab === 'interview' }]"
        @click="tab = 'interview'"
      >面试问答</button>
    </nav>

    <section v-show="tab === 'resume'" class="section">
      <div class="markdown-body resume-content" v-html="resumeHtml"></div>
    </section>

    <section v-show="tab === 'interview'" class="section">
      <input
        v-model="searchText"
        class="search-input"
        placeholder="搜索问题或答案..."
      />

      <div class="category-filter" v-if="categories.length > 1">
        <button
          :class="['cat-btn', { active: activeCategory === '' }]"
          @click="activeCategory = ''"
        >全部</button>
        <button
          v-for="cat in categories"
          :key="cat"
          :class="['cat-btn', { active: activeCategory === cat }]"
          @click="activeCategory = cat"
        >{{ cat }}</button>
      </div>

      <p v-if="!filteredQa.length" class="hint">没有匹配的问答</p>

      <div v-else class="qa-list">
        <details
          v-for="item in filteredQa"
          :key="item.id"
          class="qa-item"
          :open="!!searchText"
        >
          <summary class="qa-question">
            <span class="qa-cat">{{ item.category }}</span>
            {{ item.question }}
          </summary>
          <div class="qa-answer markdown-body" v-html="renderMd(item.answer)"></div>
        </details>
      </div>
    </section>
  </div>
</template>

<script>
import markdownToHtml from '@/utils/markdown';
import { resumeContent, interviewQa } from '@/data/career';

export default {
  data() {
    return {
      tab: 'resume',
      searchText: '',
      activeCategory: '',
      resumeHtml: markdownToHtml(resumeContent),
      interviewQa
    };
  },
  computed: {
    categories() {
      return [...new Set(this.interviewQa.map(item => item.category))];
    },
    filteredQa() {
      let list = this.interviewQa;
      if (this.activeCategory) {
        list = list.filter(item => item.category === this.activeCategory);
      }
      if (!this.searchText) return list;
      const keyword = this.searchText.toLowerCase();
      return list.filter(item =>
        item.question.toLowerCase().includes(keyword) ||
        item.answer.toLowerCase().includes(keyword) ||
        item.category.toLowerCase().includes(keyword)
      );
    }
  },
  methods: {
    renderMd(content) {
      return markdownToHtml(content);
    }
  }
};
</script>

<style scoped>
.career-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  text-align: left;
}

.page-title {
  margin: 0 0 20px;
  font-size: 1.5rem;
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 12px;
}

.tab-btn {
  padding: 8px 20px;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  background: #f5f5f5;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.tab-btn:hover {
  background: #e8e8e8;
}

.tab-btn.active {
  background: #409eff;
  color: #fff;
  border-color: #409eff;
}

.section {
  min-height: 200px;
}

.search-input {
  width: 100%;
  padding: 10px 12px;
  margin-bottom: 12px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-sizing: border-box;
}

.category-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
}

.cat-btn {
  padding: 4px 12px;
  border: 1px solid #d0d0d0;
  border-radius: 16px;
  background: #f5f5f5;
  cursor: pointer;
  font-size: 0.85rem;
}

.cat-btn.active {
  background: #409eff;
  color: #fff;
  border-color: #409eff;
}

.hint {
  color: #888;
  font-size: 0.9rem;
}

.qa-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.qa-item {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.qa-question {
  padding: 12px 16px;
  font-weight: 600;
  cursor: pointer;
  list-style: none;
  background: #fafafa;
}

.qa-question::-webkit-details-marker {
  display: none;
}

.qa-question::before {
  content: '▶ ';
  font-size: 0.7rem;
  color: #409eff;
  margin-right: 4px;
}

.qa-item[open] .qa-question::before {
  content: '▼ ';
}

.qa-cat {
  display: inline-block;
  margin-right: 8px;
  padding: 2px 8px;
  font-size: 0.75rem;
  font-weight: normal;
  color: #409eff;
  background: #ecf5ff;
  border-radius: 4px;
}

.qa-answer {
  padding: 12px 16px 16px;
  border-top: 1px solid #eee;
}

.markdown-body :deep(p) {
  margin: 0 0 8px;
  line-height: 1.6;
}

.markdown-body :deep(p:last-child) {
  margin-bottom: 0;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  margin: 0 0 8px;
  padding-left: 1.5em;
}

.markdown-body :deep(h2) {
  margin: 24px 0 12px;
  font-size: 1.15rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 6px;
}

.markdown-body :deep(h2:first-child) {
  margin-top: 0;
}

.markdown-body :deep(h3) {
  margin: 16px 0 8px;
  font-size: 1rem;
}

.markdown-body :deep(code) {
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
}

.markdown-body :deep(pre) {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
}

@media (prefers-color-scheme: dark) {
  .tabs {
    border-bottom-color: #444;
  }

  .tab-btn,
  .cat-btn {
    background: #2a2a2a;
    border-color: #444;
    color: #e0e0e0;
  }

  .tab-btn:hover,
  .cat-btn:hover {
    background: #333;
  }

  .tab-btn.active,
  .cat-btn.active {
    background: #409eff;
    color: #fff;
  }

  .search-input {
    background: #2a2a2a;
    border-color: #444;
    color: #e0e0e0;
  }

  .qa-item {
    border-color: #444;
  }

  .qa-question {
    background: #2a2a2a;
  }

  .qa-answer {
    border-top-color: #444;
  }

  .qa-cat {
    background: #1a3a5c;
  }

  .markdown-body :deep(h2) {
    border-bottom-color: #444;
  }

  .markdown-body :deep(code) {
    background: #333;
  }

  .markdown-body :deep(pre) {
    background: #2a2a2a;
  }
}
</style>
