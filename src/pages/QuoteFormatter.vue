<template>
  <div style="padding: 20px; font-family: monospace; max-width: 1200px; margin: 0 auto;">
    <h2>文本格式化工具</h2>
    <p style="color: #666; margin-bottom: 20px;">
      输入由空格或换行符分隔的数据，自动用单引号包裹并用逗号分隔
    </p>

    <!-- 输入框 -->
    <div style="margin-bottom: 20px;">
      <label style="display: block; margin-bottom: 8px; font-weight: bold;">输入数据：</label>
      <textarea
        v-model="input"
        @input="formatText"
        rows="15"
        placeholder="请输入数据，支持空格或换行符分隔，例如：&#10;apple&#10;banana&#10;orange&#10;或者：apple banana orange"
        style="width: 100%; font-family: monospace; font-size: 14px; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;"
      ></textarea>
    </div>

    <div style="margin-bottom: 20px;">
      <button @click="clearInput" style="margin-right: 10px;">清空输入</button>
      <button @click="copyResult" :disabled="!formattedResult" style="background-color: #67c23a;">复制结果</button>
    </div>

    <!-- 结果显示 -->
    <div v-if="formattedResult" style="margin-top: 20px;">
      <h3>格式化结果：</h3>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin-bottom: 15px;">
        <div style="margin-bottom: 10px;">
          <strong>数据项数量：</strong> {{ items.length }} 个
        </div>
        <div style="margin-bottom: 10px;">
          <strong>格式化后的文本：</strong>
          <div style="margin-top: 10px; padding: 10px; background-color: white; border-radius: 4px; word-break: break-all;">
            <pre style="margin: 0; white-space: pre-wrap;">{{ formattedResult }}</pre>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!formattedResult && input.trim()" style="color: #999; margin-top: 10px;">
      等待输入数据...
    </div>
  </div>
</template>

<script>
export default {
  name: "QuoteFormatter",
  data() {
    return {
      input: '',
      items: [],
      formattedResult: ''
    };
  },
  methods: {
    formatText() {
      this.items = [];
      this.formattedResult = '';

      if (!this.input.trim()) {
        return;
      }

      try {
        // 按换行符分割
        const lines = this.input.split(/\r?\n/);
        const allItems = [];

        lines.forEach(line => {
          if (line.trim()) {
            // 按空格、制表符等空白字符分割
            const parts = line.split(/\s+/);
            parts.forEach(part => {
              const trimmed = part.trim();
              if (trimmed) {
                allItems.push(trimmed);
              }
            });
          }
        });

        this.items = allItems;
        
        if (allItems.length > 0) {
          // 用单引号包裹并用逗号分隔
          this.formattedResult = allItems.map(item => `'${item}'`).join(', ');
        }
      } catch (e) {
        console.error('格式化出错：', e);
      }
    },
    clearInput() {
      this.input = '';
      this.items = [];
      this.formattedResult = '';
    },
    copyResult() {
      if (this.formattedResult) {
        navigator.clipboard.writeText(this.formattedResult).then(() => {
          alert('结果已复制到剪贴板');
        }).catch(() => {
          // 降级方案
          const textarea = document.createElement('textarea');
          textarea.value = this.formattedResult;
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

