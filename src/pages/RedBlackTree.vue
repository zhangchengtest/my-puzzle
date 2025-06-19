<template>
  <div>
    <div>
      <h3>随机数字:  {{ numbers }}</h3>
    </div>

    <div>
      <input 
        type="text" 
        v-model="customNumbersInput" 
        placeholder="输入逗号分隔的数字"
      />
      <button @click="setCustomNumbers">设置自定义数字</button>
    </div>

    <div id="log-container">
      <h3>操作日志:</h3>
      <ul class="logs">
        <li v-for="(log, index) in logs" :key="index">
          {{ log }}
        </li>
      </ul>
    </div>
    <button @click="insertNextNumber" :disabled="isComplete">下一步</button>
    <div id="tree-container">
      <div id="previous-tree" v-if="previousTreeVisible"></div>
      <div id="current-tree" style="margin-top: 50px;"></div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { RedBlackTree } from '../utils/redBlackTree.js';

export default {
  data() {
    return {
      numbers: this.generateUniqueNumbers(10, 100), // 生成不重复的随机数字
      customNumbersInput: '', // 用户输入的自定义数字
      currentIndex: 0, // 当前插入的数字索引
      isComplete: false, // 是否所有数字都已插入
      previousTreeVisible: false, // 控制是否显示上一幅树
      logs: [], // 操作日志
    };
  },
  methods: {
    // 生成唯一的随机数字
    generateUniqueNumbers(count, max) {
      const uniqueNumbers = new Set();
      while (uniqueNumbers.size < count) {
        const number = Math.floor(Math.random() * max);
        uniqueNumbers.add(number);
      }
      return Array.from(uniqueNumbers);
    },

    // 设置用户自定义的数字
    setCustomNumbers() {
      if (!this.customNumbersInput) {
        alert('请输入有效的数字！');
        return;
      }
      const customNumbers = this.customNumbersInput
        .split(',')
        .map((num) => parseInt(num.trim(), 10))
        .filter((num) => !isNaN(num));

      if (customNumbers.length === 0) {
        alert('请输入有效的数字！');
        return;
      }

      // 更新数字数组和重置状态
      this.numbers = customNumbers;
      this.currentIndex = 0;
      this.isComplete = false;
      this.logs = [];
      this.previousTreeVisible = false;

      // 重新绘制树
      this.drawCurrentTree();
    },

    insertNextNumber() {
      if (this.currentIndex < this.numbers.length) {
        const number = this.numbers[this.currentIndex];
        this.currentIndex += 1; // 更新当前数字索引
        
        // 如果已经插入完所有数字，设置完成标志
        if (this.currentIndex === this.numbers.length) {
          this.isComplete = true;
        }
        
        // 显示上一幅树，并插入新节点后的树图
        this.previousTreeVisible = true;
        
        this.drawCurrentTree();
        // 绘制树
        this.drawPreviousTree();
      }
    },

    // 绘制上一幅树
    drawPreviousTree() {
      const container = document.getElementById('previous-tree');
      container.innerHTML = ''; // 清空上一幅树容器

      // 创建一个新的 RedBlackTree 实例并插入之前的节点来展示上一幅树
      const previousTree = new RedBlackTree();
      for (let i = 0; i < this.currentIndex - 1; i++) {
        previousTree.insert(this.numbers[i]);
      }
      previousTree.draw('#previous-tree');
    },

    // 绘制当前树
    drawCurrentTree() {
      const container = document.getElementById('current-tree');
      container.innerHTML = ''; // 清空当前树容器

      // 创建一个新的 RedBlackTree 实例并插入当前节点到此时的所有节点
      const currentTree = new RedBlackTree();
      for (let i = 0; i < this.currentIndex; i++) {
        currentTree.insert(this.numbers[i]);
      }
      currentTree.draw('#current-tree');
      this.logs = [...currentTree.logs]; // 更新日志
    },
  },
  mounted() {
    // 初始时只展示空树
    this.drawCurrentTree();
  }
};
</script>


<style scoped>

#log-container {
  position: fixed; /* 固定在页面右侧 */
  top: 20px; /* 距离页面顶部 */
  right: 20px; /* 距离页面右侧 */
  width: 300px; /* 日志容器宽度 */
  max-height: 80vh; /* 最大高度 */
  overflow-y: auto; /* 超出高度时滚动 */
  border: 1px solid #ccc; /* 边框样式 */
  border-radius: 8px; /* 圆角 */
  background-color: #f9f9f9; /* 背景色 */
  padding: 10px; /* 内边距 */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* 阴影效果 */
  z-index: 1000; /* 确保悬浮容器位于页面上层 */
}

.logs li {
  font-size: 14px;
  line-height: 1.5;
}

button {
  margin-top: 20px;
}

/* 
#tree-container {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
} */

#previous-tree,
#current-tree {
  width: 45%;
  height: 300px;
  /* border: 1px solid black; */
}
</style>
