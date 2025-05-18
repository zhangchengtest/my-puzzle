<template>
  <div id="app">
    <button @click="toggleRecognition">
      {{ isRecognizing ? '停止监听' : '开始监听' }}
    </button>
    <p>识别结果：{{ transcript }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      recognition: null,  // 语音识别实例
      transcript: '',     // 识别到的文字
      isRecognizing: false,  // 是否正在识别
      lastTranscript: '', // 上次的最终识别结果
    };
  },
  mounted() {
    this.initializeRecognition();
  },
  methods: {
    // 初始化语音识别
    initializeRecognition() {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true; // 允许连续识别
        this.recognition.interimResults = true; // 实时获取识别结果

         // 设置语言为中文（普通话）
         this.recognition.lang = 'zh-CN'; // 语言设置为中文

        // 识别结果事件
        this.recognition.onresult = (event) => {
          let interimTranscript = '';
          let finalTranscript = ''; // 存储最终的识别文本

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
              finalTranscript += result[0].transcript; // 最终结果
            } else {
              interimTranscript += result[0].transcript; // 临时结果
            }
          }

          // 只有在新的最终结果时才更新
          if (finalTranscript !== this.lastTranscript) {
            this.transcript = finalTranscript; // 更新最终结果
            this.lastTranscript = finalTranscript; // 更新最后一次的识别结果
          }
        };

        // 错误事件
        this.recognition.onerror = (event) => {
          console.error('语音识别出错：', event.error);
        };

        // 识别结束时清理
        this.recognition.onend = () => {
          this.isRecognizing = false;
        };
      } else {
        alert('当前浏览器不支持语音识别');
      }
    },

    // 切换语音识别的开始和停止
    toggleRecognition() {
      if (this.isRecognizing) {
        this.stopRecognition(); // 停止语音识别
      } else {
        this.startRecognition(); // 启动语音识别
      }
    },

    // 开始语音识别
    startRecognition() {
      if (this.recognition) {
        this.transcript = ''; // 清空之前的结果
        this.lastTranscript = ''; // 清空上次的最终结果
        this.isRecognizing = true;
        this.recognition.start(); // 启动语音识别
      }
    },

    // 停止语音识别
    stopRecognition() {
      if (this.isRecognizing) {
        this.isRecognizing = false;
        this.recognition.stop(); // 停止语音识别
      }
    }
  }
};
</script>

<style scoped>
button {
  padding: 10px 20px;
  font-size: 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;
}

button:active {
  background-color: #45a049;
}

p {
  margin-top: 20px;
  font-size: 18px;
}
</style>
