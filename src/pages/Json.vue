<template>
  <div style="padding: 20px; font-family: monospace;">
    <h2>JSON 格式化工具</h2>

    <!-- 输入框 -->
    <textarea
      v-model="input"
      rows="15"
      cols="60"
      placeholder="请输入 JSON 数据"
      style="width: 100%; margin-bottom: 10px; font-family: monospace; font-size: 14px;"
    ></textarea>

    <div style="margin-bottom: 10px;">
      <button @click="formatJson" style="margin-right: 10px;">格式化</button>
      <button @click="clearInput" style="margin-right: 10px;">清空输入</button>
      <!-- 新增导出按钮 -->
      <button @click="exportHistory" style="background-color: #67c23a;">导出全部历史</button>
    </div>

    <div v-if="error" style="color: red; margin-top: 10px;">{{ error }}</div>

    <h3 style="margin-top: 30px;">历史记录（点击内容可回填）</h3>
    <ul style="max-height: 300px; overflow-y: auto; border: 1px solid #ccc; padding: 10px;">
      <li
        v-for="(record, index) in history"
        :key="index"
        style="margin-bottom: 10px; border-bottom: 1px dashed #aaa; padding-bottom: 5px;"
      >
        <div @click="loadFromHistory(record)" style="cursor: pointer; white-space: pre-wrap;">
          {{ record }}
        </div>
        <button @click="deleteHistory(index)" style="margin-top: 5px; background-color: #f56c6c;">
          删除该条记录
        </button>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "JsonFormatter",
  data() {
    return {
      input: ``,
      error: '',
      history: []
    };
  },
  mounted() {
    this.formatJson(); // 初始自动格式化
    this.loadHistory(); // 加载历史记录
  },
  methods: {
    formatJson() {
      try {
        const obj = JSON.parse(this.input);
        const formatted = JSON.stringify(obj, null, 2);
        this.input = formatted;
        this.saveToHistory(formatted);
        this.error = '';
      } catch (e) {
        this.error = 'JSON 格式错误，请检查输入。';
      }
    },
    clearInput() {
      this.input = '';
      this.error = '';
    },
    saveToHistory(jsonStr) {
      const history = JSON.parse(localStorage.getItem('jsonFormatterHistory') || '[]');
      if (history[0] !== jsonStr) {
        history.unshift(jsonStr);
      }
      localStorage.setItem('jsonFormatterHistory', JSON.stringify(history.slice(0, 20)));
      this.loadHistory();
    },
    loadHistory() {
      this.history = JSON.parse(localStorage.getItem('jsonFormatterHistory') || '[]');
    },
    loadFromHistory(record) {
      this.input = record;
      this.error = '';
    },
    deleteHistory(index) {
      const history = [...this.history];
      history.splice(index, 1);
      localStorage.setItem('jsonFormatterHistory', JSON.stringify(history));
      this.loadHistory();
    },
   exportHistory() {
  if (!this.history.length) {
    alert('没有历史记录可导出');
    return;
  }
  // 把所有历史记录拼接成纯文本，记录之间用分割线隔开
  const text = this.history.join('\n\n----------------------------------\n\n');

  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'json_formatter_history.txt';  // 后缀改为txt
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
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
