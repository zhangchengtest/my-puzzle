<template>
  <div>
    <h1>红黑树游戏</h1>
    <button @click="nextStep">下一步</button>
    <div id="tree-container"></div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { RedBlackTree } from './utils/redBlackTree.js';
import * as d3 from "d3";

export default {
  name: 'RedBlackTree',
  setup() {
    const tree = new RedBlackTree();
    const numbers = Array.from({ length: 10 }, () => Math.floor(Math.random() * 100));
    const index = ref(0);
    
    const nextStep = () => {
      if (index.value < numbers.length) {
        tree.insert(numbers[index.value]);
        index.value++;
        drawTree(tree);
      }
    };

    const drawTree = (tree) => {
      const container = document.getElementById('tree-container');
      container.innerHTML = '';  // 清空现有的树
      tree.draw(container);  // 使用 D3.js 绘制树
    };

    onMounted(() => {
      drawTree(tree);  // 初始空树
    });

    return {
      nextStep,
    };
  },
};
</script>

<style scoped>
button {
  margin-top: 20px;
}
</style>
