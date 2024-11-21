<template>
  <div class="container">
    <div class="controls">
      <select v-model="sortOrder" @change="sortData">
        <option value="clickCount">按点击次数排序</option>
        <option value="lastVisitedAt">按访问时间排序</option>
      </select>
      <button @click="showAddTagForm = !showAddTagForm">{{ showAddTagForm ? '取消' : '新增标签' }}</button>
    </div>

    <!-- 新增标签表单 -->
    <div v-if="showAddTagForm" class="add-tag-form">
      <input v-model="newTag.url" placeholder="网址" type="text" />
      <input v-model="newTag.tag" placeholder="标签" type="text" />
      <button @click="addTag">添加标签</button>
    </div>

    <div class="website-list">
      <div v-for="item in websiteTags" :key="item.id" class="website-item">
        <h3>{{ item.url }}</h3>
        <p>标签: 
          <a href="javascript:void(0);" 
         @click="handleClick(item.id, item.url)"
         rel="noopener noreferrer">
        {{ item.tag }}
      </a></p>
        <p>点击次数: {{ item.clickCount }}</p>
        <p>最新访问时间: {{ item.lastVisitedAtText }}</p>
        <button @click="confirmDelete(item.id)">删除</button> <!-- 添加删除按钮 -->
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      websiteTags: [],   // 存储获取到的数据
      sortOrder: 'lastVisitedAt',  // 默认按点击次数排序
      showAddTagForm: false,    // 控制新增标签表单显示与否
      newTag: {
        url: '',
        tag: ''
      }
    };
  },
  mounted() {
    // 页面加载时获取数据
    this.fetchWebsiteTags();
  },
  methods: {
    // 获取 website_tag 数据
    async fetchWebsiteTags() {
      try {
        const response = await this.$http.get('https://clock.cuiyi.club/openapi/websiteTags/all'); // 替换为你的API接口
        this.websiteTags = response.data.data.map(item => this.camelToSnake(item));
        this.sortData(); // 获取数据后进行排序
      } catch (error) {
        console.error('获取数据失败:', error);
      }
    },
    // 驼峰命名转换为前端需要的命名
    camelToSnake(item) {
      return {
        id: item.id,
        url: item.url,
        tag: item.tag,
        clickCount: item.clickCount,
        lastVisitedAt: item.lastVisitedAt,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        lastVisitedAtText: this.formatDate(item.lastVisitedAt),
      };
    },
    // 按点击次数排序
    sortByClickCount() {
      this.sortOrder = 'clickCount';
      this.sortData();
    },
    // 按访问时间排序
    sortByLastVisited() {
      this.sortOrder = 'lastVisitedAt';
      this.sortData();
    },
    // 排序数据
    sortData() {
      if (this.sortOrder === 'clickCount') {
        this.websiteTags.sort((a, b) => b.clickCount - a.clickCount); // 按点击次数降序排列
      } else if (this.sortOrder === 'lastVisitedAt') {
        this.websiteTags.sort((a, b) => new Date(b.lastVisitedAt) - new Date(a.lastVisitedAt)); // 按访问时间降序排列
      }
    },

   formatDate(dateStr) {
      const date = new Date(dateStr);
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始，需要加1
      const day = String(date.getDate()).padStart(2, '0');
      
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');

      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
    ,
    
    // 添加标签
    async addTag() {
      if (!this.newTag.url || !this.newTag.tag) {
        alert('请填写网址和标签');
        return;
      }
      try {
        // 发送 API 请求，添加新的标签
        const response = await this.$http.post('https://clock.cuiyi.club/openapi/websiteTags/add', this.newTag);
         // 将新标签插入到数组的开头
        this.websiteTags.unshift(response.data.data);

        this.showAddTagForm = false;  // 隐藏表单
        this.newTag = { url: '', tag: '' }; // 重置表单
      } catch (error) {
        console.error('添加标签失败:', error);
      }
    }
  ,

   // 点击标签时处理逻辑
   async handleClick(id, url) {
    try {
      // 调用后端 API 更新点击次数
      await this.$http.post(`https://clock.cuiyi.club/openapi/websiteTags/click`, { id });
      
      // 更新本地数据，优化用户体验（可选）
      const tag = this.websiteTags.find(item => item.id === id);
      if (tag) {
        tag.clickCount += 1;
        tag.lastVisitedAt = new Date().toISOString(); // 更新访问时间
        tag.lastVisitedAtText = this.formatDate(tag.lastVisitedAt);
      }
      this.sortData();
      
      // 跳转到目标链接
      window.open(url, '_blank');
    } catch (error) {
      console.error('记录点击次数失败:', error);
      alert('记录点击次数失败，请稍后重试');
    }
  },
     // 确认删除
  confirmDelete(tagId) {
    if (confirm('确认要删除这个标签吗？')) {
      this.deleteTag(tagId);
    }
  },

  // 删除标签
  async deleteTag(tagId) {
    try {
      // 调用后端删除接口
      await this.$http.delete(`https://clock.cuiyi.club/openapi/websiteTags/delete/${tagId}`);
      
      // 删除成功后更新前端数据
      this.websiteTags = this.websiteTags.filter(item => item.id !== tagId);
    } catch (error) {
      console.error('删除标签失败:', error);
      alert('删除标签失败，请稍后再试');
    }
  }
  }
};
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.controls {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

.add-tag-form {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.add-tag-form input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  width: 100%;
  max-width: 400px;
}

.website-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.website-item {
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #f9f9f9;
}

.website-item h3 {
  margin: 0;
  font-size: 18px;
}

.website-item p {
  margin: 5px 0;
}

@media (max-width: 768px) {
  .controls {
    flex-direction: column;
    gap: 15px;
  }

  .website-item {
    padding: 10px;
  }
}

button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

button.delete {
  background-color: #dc3545; /* 红色按钮 */
}

button.delete:hover {
  background-color: #c82333; /* 深红色 */
}
</style>
