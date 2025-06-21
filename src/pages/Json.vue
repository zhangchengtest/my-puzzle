<template>
  <div style="padding: 20px; font-family: monospace;">
    <h2>JSON 格式化工具</h2>

    <!-- 单个 textarea 用于输入和格式化显示 -->
    <textarea
      v-model="input"
      rows="15"
      cols="60"
      placeholder="请输入 JSON 数据"
      style="width: 100%; margin-bottom: 10px; font-family: monospace; font-size: 14px;"
    ></textarea>

    <div style="margin-bottom: 10px;">
      <button @click="formatJson" style="margin-right: 10px;">格式化</button>
      <button @click="clear">清空</button>
    </div>

    <div v-if="error" style="color: red; margin-top: 10px;">{{ error }}</div>
  </div>
</template>

<script>
export default {
  name: "JsonFormatter",
  data() {
    return {
      input: `{
  "name": "张三",
  "age": 28,
  "skills": ["JavaScript", "Vue", "Node.js"],
  "address": {
    "city": "上海",
    "code": "200000"
  }
}`,
      error: ''
    };
  },
  mounted() {
    this.formatJson(); // 初始加载时自动格式化
  },
  methods: {
    formatJson() {
      try {
        const obj = JSON.parse(this.input);
        this.input = JSON.stringify(obj, null, 2);
        this.error = '';
      } catch (e) {
        this.error = 'JSON 格式错误，请检查输入。';
      }
    },
    clear() {
      this.input = '';
      this.error = '';
    }
  }
};
</script>

<style scoped>
button {
  padding: 6px 12px;
  font-size: 14px;
  cursor: pointer;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
}
button:hover {
  background-color: #66b1ff;
}
</style>
