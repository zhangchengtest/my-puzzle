<template>
  <div style="padding: 20px; font-family: monospace; max-width: 1200px; margin: 0 auto;">
    <h2>数字求和工具</h2>
    <p style="color: #666; margin-bottom: 20px;">
      粘贴数字列表，支持每行一个数字，或用空格、逗号、制表符分隔
    </p>

    <!-- 输入框 -->
    <textarea
      v-model="input"
      @input="calculateSum"
      @paste="handlePaste"
      rows="15"
      placeholder="请粘贴数字，例如：&#10;1&#10;2&#10;3&#10;或者：1 2 3&#10;或者：1,2,3"
      style="width: 100%; margin-bottom: 10px; font-family: monospace; font-size: 14px; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;"
    ></textarea>

    <div style="margin-bottom: 20px;">
      <button @click="clearInput" style="margin-right: 10px;">清空输入</button>
      <button @click="copyResult" :disabled="!sum" style="background-color: #67c23a;">复制结果</button>
    </div>

    <!-- 结果显示 -->
    <div v-if="numbers.length > 0" style="margin-top: 20px;">
      <h3>解析结果：</h3>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin-bottom: 15px;">
        <div style="margin-bottom: 10px;">
          <strong>识别到的数字数量：</strong> {{ numbers.length }} 个
        </div>
        <div style="margin-bottom: 10px;">
          <strong>数字列表：</strong>
          <div style="max-height: 200px; overflow-y: auto; margin-top: 5px; padding: 10px; background-color: white; border-radius: 4px;">
            <span v-for="(num, index) in numbers" :key="index" style="display: inline-block; margin: 2px 5px;">
              {{ formatNumber(num) }}<span v-if="index < numbers.length - 1">,</span>
            </span>
          </div>
        </div>
        <div style="font-size: 24px; font-weight: bold; color: #409eff; margin-top: 15px;">
          <strong>总和：</strong> {{ formatNumber(sum) }}
        </div>
      </div>
    </div>

    <div v-if="error" style="color: red; margin-top: 10px; padding: 10px; background-color: #fee; border-radius: 4px;">
      {{ error }}
    </div>

    <div v-if="numbers.length === 0 && !error" style="color: #999; margin-top: 10px;">
      等待输入数字...
    </div>
  </div>
</template>

<script>
export default {
  name: "NumberSum",
  data() {
    return {
      input: '',
      numbers: [],
      sum: null,
      error: ''
    };
  },
  methods: {
    formatNumber(num) {
      if (num === null || num === undefined) return '';
      return parseFloat(num).toFixed(2);
    },
    handlePaste(event) {
      // 粘贴后自动计算
      setTimeout(() => {
        this.calculateSum();
      }, 10);
    },
    calculateSum() {
      this.error = '';
      this.numbers = [];
      this.sum = null;

      if (!this.input.trim()) {
        return;
      }

      try {
        // 处理输入：先按换行分割，然后按空格、逗号、制表符分割
        const lines = this.input.split(/\r?\n/);
        const allNumbers = [];

        lines.forEach(line => {
          if (line.trim()) {
            // 按空格、逗号、制表符、分号等分隔符分割
            const parts = line.split(/[\s,;\t]+/);
            parts.forEach(part => {
              const trimmed = part.trim();
              if (trimmed) {
                // 尝试解析为数字
                const num = parseFloat(trimmed);
                if (!isNaN(num) && isFinite(num)) {
                  allNumbers.push(num);
                }
              }
            });
          }
        });

        if (allNumbers.length === 0) {
          this.error = '未识别到有效数字，请检查输入格式';
          return;
        }

        this.numbers = allNumbers;
        this.sum = allNumbers.reduce((acc, num) => acc + num, 0);
      } catch (e) {
        this.error = '计算出错：' + e.message;
      }
    },
    clearInput() {
      this.input = '';
      this.numbers = [];
      this.sum = null;
      this.error = '';
    },
    copyResult() {
      if (this.sum !== null) {
        const formattedNumbers = this.numbers.map(num => this.formatNumber(num));
        const text = `数字数量：${this.numbers.length}\n数字列表：${formattedNumbers.join(', ')}\n总和：${this.formatNumber(this.sum)}`;
        navigator.clipboard.writeText(text).then(() => {
          alert('结果已复制到剪贴板');
        }).catch(() => {
          // 降级方案
          const textarea = document.createElement('textarea');
          textarea.value = text;
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
          alert('结果已复制到剪贴板');
        });
      }
    }
  }
};
</script>

<style scoped>
button {
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  transition: background-color 0.3s;
}
button:hover:not(:disabled) {
  background-color: #66b1ff;
}
button:disabled {
  background-color: #c0c4cc;
  cursor: not-allowed;
}
</style>
