<template>
  <div style="padding: 20px; font-family: monospace;">
    <h2>二维码生成器</h2>
    
    <!-- 说明区域 -->
    <div style="background-color: #ecf5ff; border: 1px solid #b3d8ff; border-radius: 4px; padding: 12px; margin-bottom: 20px;">
      <p style="margin: 0; color: #409eff; font-size: 14px;">
        💡 <strong>支持任意内容：</strong>普通文本、网址链接、电话号码、邮箱地址、Wi-Fi配置、电子名片(vCard)、地理位置、社交账号等
      </p>
    </div>

    <!-- 输入框 -->
    <div style="margin-bottom: 20px;">
      <label style="display: block; margin-bottom: 5px; font-weight: bold;">输入内容：</label>
      <textarea
        v-model="input"
        rows="6"
        placeholder="支持任意文本内容：网址、文字、联系方式、Wi-Fi密码、邮箱、手机号等..."
        style="width: 100%; font-family: monospace; font-size: 14px; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"
      ></textarea>
      
      <!-- 快速示例 -->
      <div style="margin-top: 10px; display: flex; gap: 8px; flex-wrap: wrap;">
        <small style="color: #666; margin-right: 5px;">快速示例：</small>
        <button @click="input = 'https://www.baidu.com'" class="example-btn">网址</button>
        <button @click="input = '这是一段文本内容，可以是任何文字。'" class="example-btn">文本</button>
        <button @click="input = 'tel:13800138000'" class="example-btn">电话</button>
        <button @click="input = 'mailto:example@email.com'" class="example-btn">邮箱</button>
        <button @click="input = 'WIFI:T:WPA;S:MyWiFi;P:password123;;'" class="example-btn">Wi-Fi</button>
        <button @click="input = 'BEGIN:VCARD\nVERSION:3.0\nFN:张三\nTEL:13800138000\nEMAIL:zhangsan@example.com\nEND:VCARD'" class="example-btn">名片</button>
      </div>
    </div>

    <!-- 设置选项 -->
    <div style="margin-bottom: 20px; display: flex; gap: 20px; flex-wrap: wrap;">
      <div>
        <label style="display: block; margin-bottom: 5px;">尺寸：</label>
        <input v-model.number="size" type="number" min="100" max="1000" step="50" 
          style="width: 120px; padding: 5px; border: 1px solid #ddd; border-radius: 4px;" />
        <span style="margin-left: 5px;">px</span>
      </div>
      
      <div>
        <label style="display: block; margin-bottom: 5px;">纠错级别：</label>
        <select v-model="errorCorrectionLevel" 
          style="padding: 5px; border: 1px solid #ddd; border-radius: 4px;">
          <option value="L">低 (L) - 7%</option>
          <option value="M">中 (M) - 15%</option>
          <option value="Q">较高 (Q) - 25%</option>
          <option value="H">高 (H) - 30%</option>
        </select>
      </div>

      <div>
        <label style="display: block; margin-bottom: 5px;">前景色：</label>
        <input v-model="darkColor" type="color" 
          style="width: 60px; height: 32px; border: 1px solid #ddd; border-radius: 4px; cursor: pointer;" />
      </div>

      <div>
        <label style="display: block; margin-bottom: 5px;">背景色：</label>
        <input v-model="lightColor" type="color" 
          style="width: 60px; height: 32px; border: 1px solid #ddd; border-radius: 4px; cursor: pointer;" />
      </div>
    </div>

    <!-- 操作按钮 -->
    <div style="margin-bottom: 20px;">
      <button @click="generateQRCode" style="margin-right: 10px;">生成二维码</button>
      <button @click="downloadQRCode" style="margin-right: 10px; background-color: #67c23a;">下载二维码</button>
      <button @click="clearInput" style="background-color: #909399;">清空</button>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" style="color: red; margin-bottom: 10px; padding: 10px; background-color: #fef0f0; border-radius: 4px;">
      {{ error }}
    </div>

    <!-- 二维码显示区域 -->
    <div v-show="qrCodeDataUrl" style="margin-top: 30px; text-align: center;">
      <h3>生成的二维码：</h3>
      <div style="display: inline-block; padding: 20px; background-color: white; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.1);">
        <img :src="qrCodeDataUrl" alt="QR Code" style="display: block;" />
      </div>
      <p style="margin-top: 10px; color: #666; font-size: 12px;">
        扫描二维码以访问内容
      </p>
    </div>

    <!-- 历史记录 -->
    <h3 style="margin-top: 40px;">历史记录（点击可重新生成）</h3>
    <ul style="max-height: 300px; overflow-y: auto; border: 1px solid #ccc; padding: 10px; border-radius: 4px; background-color: #f9f9f9;">
      <li
        v-for="(record, index) in history"
        :key="index"
        style="margin-bottom: 10px; border-bottom: 1px dashed #aaa; padding-bottom: 10px; display: flex; justify-content: space-between; align-items: start;"
      >
        <div @click="loadFromHistory(record)" 
          style="cursor: pointer; flex: 1; padding: 8px; background-color: white; border-radius: 4px; word-break: break-all;">
          <small style="color: #999;">{{ record.timestamp }}</small><br>
          {{ record.content }}
        </div>
        <button @click="deleteHistory(index)" 
          style="margin-left: 10px; background-color: #f56c6c; white-space: nowrap;">
          删除
        </button>
      </li>
      <li v-if="history.length === 0" style="text-align: center; color: #999; padding: 20px;">
        暂无历史记录
      </li>
    </ul>
  </div>
</template>

<script>
import QRCode from 'qrcode';

export default {
  name: "QRCodeGenerator",
  data() {
    return {
      input: '',
      size: 300,
      errorCorrectionLevel: 'M',
      darkColor: '#000000',
      lightColor: '#ffffff',
      qrCodeDataUrl: '',
      error: '',
      history: []
    };
  },
  mounted() {
    this.loadHistory();
  },
  methods: {
    async generateQRCode() {
      if (!this.input.trim()) {
        this.error = '请输入要转换的内容';
        return;
      }

      try {
        this.qrCodeDataUrl = await QRCode.toDataURL(this.input, {
          width: this.size,
          margin: 1,
          errorCorrectionLevel: this.errorCorrectionLevel,
          color: {
            dark: this.darkColor,
            light: this.lightColor
          }
        });
        
        this.error = '';
        this.saveToHistory();
      } catch (err) {
        this.error = '生成二维码失败：' + err.message;
        console.error(err);
      }
    },
    
    async downloadQRCode() {
      if (!this.qrCodeDataUrl) {
        this.error = '请先生成二维码';
        return;
      }

      try {
        const link = document.createElement('a');
        link.download = `qrcode_${Date.now()}.png`;
        link.href = this.qrCodeDataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        this.error = '下载失败：' + err.message;
      }
    },
    
    clearInput() {
      this.input = '';
      this.error = '';
      this.qrCodeDataUrl = '';
    },
    
    saveToHistory() {
      const record = {
        content: this.input,
        timestamp: new Date().toLocaleString('zh-CN'),
        settings: {
          size: this.size,
          errorCorrectionLevel: this.errorCorrectionLevel,
          darkColor: this.darkColor,
          lightColor: this.lightColor
        }
      };
      
      const history = JSON.parse(localStorage.getItem('qrcodeHistory') || '[]');
      
      // 避免重复添加相同内容
      const exists = history.find(h => h.content === record.content);
      if (!exists) {
        history.unshift(record);
        localStorage.setItem('qrcodeHistory', JSON.stringify(history.slice(0, 20)));
        this.loadHistory();
      }
    },
    
    loadHistory() {
      this.history = JSON.parse(localStorage.getItem('qrcodeHistory') || '[]');
    },
    
    loadFromHistory(record) {
      this.input = record.content;
      if (record.settings) {
        this.size = record.settings.size;
        this.errorCorrectionLevel = record.settings.errorCorrectionLevel;
        this.darkColor = record.settings.darkColor;
        this.lightColor = record.settings.lightColor;
      }
      this.generateQRCode();
    },
    
    deleteHistory(index) {
      const history = [...this.history];
      history.splice(index, 1);
      localStorage.setItem('qrcodeHistory', JSON.stringify(history));
      this.loadHistory();
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

button:hover {
  background-color: #66b1ff;
}

button:active {
  transform: scale(0.98);
}

/* 示例按钮样式 */
.example-btn {
  padding: 4px 10px;
  font-size: 12px;
  background-color: #e4e7ed;
  color: #606266;
  border: 1px solid #dcdfe6;
}

.example-btn:hover {
  background-color: #409eff;
  color: white;
  border-color: #409eff;
}

textarea {
  resize: vertical;
}

input[type="number"],
input[type="color"],
select {
  font-family: inherit;
}
</style>

