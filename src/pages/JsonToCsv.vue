<template>
  <div style="padding: 20px; font-family: monospace; max-width: 1200px; margin: 0 auto;">
    <h2>JSON 转 CSV 导出工具</h2>
    <p style="color: #666; margin-bottom: 20px;">
      支持单个对象或对象数组，JSON的key将作为CSV表头
    </p>
    
    <div style="margin-bottom: 20px;">
      <label style="display: block; margin-bottom: 10px; font-weight: bold;">输入 JSON 数据：</label>
      <textarea
        v-model="jsonInput"
        rows="15"
        placeholder='请输入 JSON，例如：
[
  {"name": "张三", "age": 25, "city": "北京"},
  {"name": "李四", "age": 30, "city": "上海"}
]

或单个对象：
{"name": "张三", "age": 25, "city": "北京"}'
        style="width: 100%; padding: 10px; font-family: monospace; border: 1px solid #ddd; border-radius: 4px;"
      ></textarea>
    </div>

    <div style="margin-bottom: 20px;">
      <label style="display: inline-block; margin-right: 10px;">文件名：</label>
      <input 
        v-model="fileName" 
        placeholder="请输入文件名（不含扩展名）" 
        style="padding: 8px; border: 1px solid #ddd; border-radius: 4px; width: 300px;"
      />
      <span style="margin-left: 5px;">.csv</span>
    </div>

    <div style="margin-bottom: 20px;">
      <button 
        @click="exportCSV" 
        style="padding: 10px 20px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;"
        :disabled="!isValidJson"
      >
        导出 CSV
      </button>
      <button 
        @click="clearInput" 
        style="padding: 10px 20px; background-color: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; margin-left: 10px;"
      >
        清空
      </button>
    </div>

    <div v-if="errorMessage" style="color: red; margin-bottom: 20px;">
      {{ errorMessage }}
    </div>

    <div v-if="previewData.length > 0" style="margin-top: 30px;">
      <h3>预览（前10行）：</h3>
      <div style="overflow-x: auto; border: 1px solid #ddd; border-radius: 4px;">
        <table style="width: 100%; border-collapse: collapse; background-color: white;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th 
                v-for="header in headers" 
                :key="header" 
                style="padding: 10px; border: 1px solid #ddd; text-align: left; font-weight: bold;"
              >
                {{ header }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in previewData.slice(0, 10)" :key="index">
              <td 
                v-for="header in headers" 
                :key="header" 
                style="padding: 10px; border: 1px solid #ddd;"
              >
                {{ formatValue(row[header]) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="previewData.length > 10" style="color: #666; margin-top: 10px;">
        总共 {{ previewData.length }} 行数据，仅显示前 10 行
      </p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      jsonInput: '',
      fileName: 'export',
      errorMessage: '',
      previewData: [],
      headers: []
    };
  },
  computed: {
    isValidJson() {
      if (!this.jsonInput.trim()) return false;
      try {
        const parsed = JSON.parse(this.jsonInput);
        return typeof parsed === 'object' && parsed !== null;
      } catch {
        return false;
      }
    }
  },
  watch: {
    jsonInput() {
      this.updatePreview();
    }
  },
  methods: {
    formatValue(value) {
      if (value === null || value === undefined) return '';
      // 如果是对象或数组，转换为JSON字符串显示
      if (typeof value === 'object') {
        return JSON.stringify(value);
      }
      return value;
    },

    updatePreview() {
      this.errorMessage = '';
      this.previewData = [];
      this.headers = [];

      if (!this.jsonInput.trim()) return;

      try {
        const parsed = JSON.parse(this.jsonInput);
        let data = [];

        // 如果是数组，直接使用
        if (Array.isArray(parsed)) {
          data = parsed;
        } 
        // 如果是单个对象，转为数组
        else if (typeof parsed === 'object' && parsed !== null) {
          data = [parsed];
        } 
        else {
          this.errorMessage = '请输入有效的 JSON 对象或对象数组';
          return;
        }

        if (data.length === 0) {
          this.errorMessage = 'JSON 数据为空';
          return;
        }

        // 收集所有可能的键作为表头
        const headersSet = new Set();
        data.forEach(item => {
          if (typeof item === 'object' && item !== null) {
            Object.keys(item).forEach(key => headersSet.add(key));
          }
        });

        this.headers = Array.from(headersSet);
        this.previewData = data;

      } catch (e) {
        this.errorMessage = 'JSON 解析失败：' + e.message;
      }
    },

    exportCSV() {
      this.errorMessage = '';

      if (!this.isValidJson) {
        this.errorMessage = '请输入有效的 JSON 数据';
        return;
      }

      try {
        const parsed = JSON.parse(this.jsonInput);
        let data = [];

        // 处理数据
        if (Array.isArray(parsed)) {
          data = parsed;
        } else if (typeof parsed === 'object' && parsed !== null) {
          data = [parsed];
        } else {
          this.errorMessage = '请输入有效的 JSON 对象或对象数组';
          return;
        }

        if (data.length === 0) {
          this.errorMessage = 'JSON 数据为空';
          return;
        }

        // 收集所有键作为表头
        const headersSet = new Set();
        data.forEach(item => {
          if (typeof item === 'object' && item !== null) {
            Object.keys(item).forEach(key => headersSet.add(key));
          }
        });

        const headers = Array.from(headersSet);

        // 生成 CSV 内容
        const csvContent = this.generateCSV(headers, data);

        // 下载文件
        this.downloadCSV(csvContent, this.fileName || 'export');

      } catch (e) {
        this.errorMessage = '导出失败：' + e.message;
      }
    },

    generateCSV(headers, data) {
      // 处理CSV字段值，添加引号和转义
      const escapeCSVValue = (value) => {
        if (value === null || value === undefined) return '';
        
        // 如果是对象或数组，转换为JSON字符串
        let stringValue;
        if (typeof value === 'object') {
          stringValue = JSON.stringify(value);
        } else {
          stringValue = String(value);
        }
        
        // 如果包含逗号、引号、换行符，需要用引号包裹
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          // 引号需要转义为两个引号
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        
        return stringValue;
      };

      // 生成表头
      const headerRow = headers.map(escapeCSVValue).join(',');

      // 生成数据行
      const dataRows = data.map(item => {
        return headers.map(header => {
          const value = item[header];
          return escapeCSVValue(value);
        }).join(',');
      });

      // 合并所有行
      return [headerRow, ...dataRows].join('\n');
    },

    downloadCSV(content, filename) {
      // 添加 BOM 以支持 Excel 正确显示中文
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
      
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    },

    clearInput() {
      this.jsonInput = '';
      this.errorMessage = '';
      this.previewData = [];
      this.headers = [];
    }
  },
  mounted() {
    // 设置示例数据（包含嵌套对象）
    const exampleData = [
      { 
        "姓名": "张三", 
        "年龄": 25, 
        "城市": "北京", 
        "职业": "工程师",
        "联系方式": { "电话": "13800138000", "邮箱": "zhangsan@example.com" },
        "技能": ["Java", "Python", "Vue"]
      },
      { 
        "姓名": "李四", 
        "年龄": 30, 
        "城市": "上海", 
        "职业": "设计师",
        "联系方式": { "电话": "13900139000", "邮箱": "lisi@example.com" },
        "技能": ["Photoshop", "Figma"]
      },
      { 
        "姓名": "王五", 
        "年龄": 28, 
        "城市": "深圳", 
        "职业": "产品经理",
        "联系方式": { "电话": "13700137000", "邮箱": "wangwu@example.com" },
        "技能": ["Axure", "数据分析", "用户研究"]
      }
    ];
    this.jsonInput = JSON.stringify(exampleData, null, 2);
  }
};
</script>

<style scoped>
button:disabled {
  background-color: #ccc !important;
  cursor: not-allowed !important;
}

button:hover:not(:disabled) {
  opacity: 0.9;
}
</style>

