<template>
  <div>
    <div>
      <h3>随机数字:</h3>
      <ul class="horizontal-list">
        <li v-for="(number, index) in numbers" :key="index">
          {{ number }}
        </li>
      </ul>
    </div>

    <div id="tree-container">
      <div id="previous-tree" v-if="previousTreeVisible"></div>
      <div id="current-tree"></div>
    </div>

    <button @click="insertNextNumber" :disabled="isComplete">下一步</button>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { RedBlackTree } from './utils/redBlackTree.js';

export default {
  data() {
    return {
      numbers: this.generateUniqueNumbers(10, 100), // 生成不重复的随机数字
      currentIndex: 0, // 当前插入的数字索引
      isComplete: false, // 是否所有数字都已插入
      previousTreeVisible: false, // 控制是否显示上一幅树
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
    },
  },
  mounted() {
    // 初始时只展示空树
    this.drawCurrentTree();
  }
};
</script>

<style scoped>
button {
  margin-top: 20px;
}

ul {
  display: flex; /* 使列表横向排列 */
  padding: 0;
  list-style-type: none;
}

li {
  font-size: 16px;
  margin-right: 10px; /* 调整数字之间的间距 */
}

#tree-container {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

#previous-tree,
#current-tree {
  width: 45%;
  height: 300px;
  /* border: 1px solid black; */
}
</style>
