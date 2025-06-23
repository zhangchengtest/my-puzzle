<template>
  <div>
    <!-- 悬浮的添加新块按钮 -->
    <button class="add-btn" @click="addDiv">添加新块</button>
    <!-- 添加顶部空白的按钮 -->
<button class="add-margin-btn" @click="addTopMargin">顶部加50px空白</button>


    <!-- 动态生成的可拖拽的 div 块 -->
    <div
      v-for="(item, index) in divs"
      :key="item.id"
      :style="{
        left: `${item.position.left}px`,
        top: `${item.position.top}px`,
        backgroundColor: item.color,
        borderRadius: item.borderRadius,
        width: item.width + 'px', // 随机宽度
        height: 'auto', // 高度自适应
        padding: '10px'
      }"
      @mousedown="startDrag($event, index)"
      @touchstart="handleTouchStart($event, index)"
      @dblclick="showContextMenu($event, index)" 
      class="draggable"
    >
      {{ item.text }}
    </div>

    <!-- 右键菜单 -->
    <div v-if="contextMenuVisible" 
         :style="{ left: `${contextMenuPosition.x}px`, top: `${contextMenuPosition.y}px` }"
         class="context-menu"
         ref="contextMenu"
    >
      <ul>
        <li @click="removeDiv(contextMenuIndex)">删除</li>
        <li @click="editText(contextMenuIndex)">更改内容</li>
        <li @click="copyContent(contextMenuIndex)">复制内容</li> <!-- 新增复制功能 -->
        <li @click="duplicateDiv(contextMenuIndex)">复制并粘贴</li>

      </ul>
    </div>
  </div>
  <Toast ref="toast" />
  <MultiLineInput ref="inputBox" />

</template>

<script>
import Toast from './components/Toast.vue';
import MultiLineInput from './components/MultiLineInput.vue';


export default {
  components: {
    Toast,
    MultiLineInput
  },
  data() {
    return {
      isDragging: false,  // 标志是否正在拖拽
      offsetX: 0,
      offsetY: 0,
      draggingIndex: null,
      dragged: false,
      divs: JSON.parse(localStorage.getItem('divs')) || [],
      contextMenuVisible: false,
      contextMenuPosition: { x: 0, y: 0 },
      contextMenuIndex: null,
      lastTouchTime: 0,  // 用于存储上次触摸的时间
    };
  },
  methods: {
    addTopMargin() {
      this.divs.forEach(div => {
        div.position.top += 50;
      });
      this.saveDivs(); // 保存更新后的位置
    },
    showToast(msg) {
      this.$refs.toast.show(msg);
    },
    randomColor() {
      const r = Math.floor(Math.random() * 256);
      const g = Math.floor(Math.random() * 256);
      const b = Math.floor(Math.random() * 256);
      return `rgb(${r}, ${g}, ${b})`;
    },

    randomStyle() {
      const borderRadius = Math.random() < 0.5 ? `${Math.floor(Math.random() * 50)}%` : '0%'; // 随机圆角
      return { borderRadius };
    },

    randomWidth() {
      return Math.floor(Math.random() * 150 + 100);  // 随机宽度 100 - 250px
    },

    addDiv() {
      const newDiv = {
        id: Date.now(),
        text: '拖拽我', // 默认文本
        position: { left: 100, top: 100 },
        color: this.randomColor(),
        width: this.randomWidth(), // 随机宽度
        ...this.randomStyle() // 随机样式（圆角）
      };
      this.divs.push(newDiv);
      this.saveDivs();
    },

    // 启动拖拽事件
    startDrag(e, index) {
      e.preventDefault();
      this.isDragging = true;
      this.dragged = false;
      this.offsetX = (e.clientX || e.touches[0].clientX) - this.divs[index].position.left;
      this.offsetY = (e.clientY || e.touches[0].clientY) - this.divs[index].position.top;
      this.draggingIndex = index;

      if (e.type === 'mousedown') {
        document.onmousemove = this.onDrag;
        document.onmouseup = this.stopDrag;
      } else if (e.type === 'touchstart') {
        document.ontouchmove = this.onDrag;
        document.ontouchend = this.stopDrag;
      }

      document.body.style.userSelect = 'none'; // 防止文本选择
    },

    onDrag(e) {
      if (this.isDragging && this.draggingIndex !== null) {
        this.dragged = true;
        const item = this.divs[this.draggingIndex];
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        
        item.position.left = clientX - this.offsetX;
        item.position.top = clientY - this.offsetY;
        
        this.saveDivs();
      }
    },

    stopDrag() {
      this.isDragging = false;
      document.body.style.userSelect = '';
      document.onmousemove = null;
      document.onmouseup = null;
      document.ontouchmove = null;
      document.ontouchend = null;
    },

    removeDiv(index) {
      this.divs.splice(index, 1);
      this.saveDivs();
    },

    saveDivs() {
      localStorage.setItem('divs', JSON.stringify(this.divs));
    },

    handleTouchStart(e, index) {
      if (this.isDragging) return;
      const currentTime = Date.now();
      const timeDifference = currentTime - this.lastTouchTime;

      if (timeDifference < 300) {
        this.showContextMenu(e, index);  
      }

      this.lastTouchTime = currentTime;
    },

    showContextMenu(e, index) {
  e.preventDefault(); // 防止默认右键菜单
  this.contextMenuVisible = true;

  const x = e.pageX || (e.changedTouches && e.changedTouches[0].pageX);
  const y = e.pageY || (e.changedTouches && e.changedTouches[0].pageY);

  this.contextMenuPosition = { x, y };
  this.contextMenuIndex = index;
}
,

    async editText(index) {
      const currentText = this.divs[index].text;
      const newText = await this.$refs.inputBox.open(currentText);
      if (newText !== null) {
        this.divs[index].text = newText;
        this.saveDivs();
      }
      this.contextMenuVisible = false;
    },

    // 新增的复制内容方法
    copyContent(index) {
      const textToCopy = this.divs[index].text;

      // 使用 Clipboard API 复制文本
      navigator.clipboard.writeText(textToCopy).then(() => {
        this.showToast('内容已复制到剪贴板！');
      }).catch(err => {
        alert('复制失败: ' + err);
      });

      this.contextMenuVisible = false;
    },

    duplicateDiv(index) {
      const original = this.divs[index];
      const newDiv = {
        ...JSON.parse(JSON.stringify(original)), // 深拷贝
        id: Date.now(), // 新 id
        position: {
          left: original.position.left + 30, // 偏移一点
          top: original.position.top + 30
        }
      };
      this.divs.push(newDiv);
      this.saveDivs();
      this.contextMenuVisible = false;
      this.showToast('已复制一个新块！');
    },

    hideContextMenu(e) {
      if (this.contextMenuVisible && this.$refs.contextMenu && !this.$refs.contextMenu.contains(e.target)) {
        this.contextMenuVisible = false;
      }
    }
  },

  mounted() {
    document.addEventListener('mousedown', this.hideContextMenu);
    document.addEventListener('touchstart', this.hideContextMenu);
  },

  beforeDestroy() {
    document.removeEventListener('mousedown', this.hideContextMenu);
    document.removeEventListener('touchstart', this.hideContextMenu);
  }
};
</script>

<style scoped>

.add-margin-btn {
  position: fixed;
  bottom: 100px; /* 比添加按钮略高 */
  right: 30px;
  padding: 10px 20px;
  background-color: #2196F3;
  color: white;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease;
}

.add-margin-btn:hover {
  background-color: #1976D2;
}

.add-btn {
  position: fixed;
  bottom: 30px;
  right: 30px;
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  font-size: 16px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease;
}

.add-btn:hover {
  background-color: #45a049;
}

.draggable {
  background-color: lightblue;
  text-align: center;
  line-height: 1.5rem;
  cursor: move;
  position: absolute;
  margin-bottom: 10px;
  word-wrap: break-word;  /* 自动换行 */
  white-space: normal; /* 确保自动换行 */
  width: auto;  /* 宽度由随机值决定 */
  height: auto; /* 自适应高度 */
  min-width: 100px;
  min-height: 50px;
  padding: 10px;
}

.context-menu {
  position: absolute;
  background-color: white;
  border: 1px solid #ccc;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 10px 0;
  z-index: 100;
}

.context-menu ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.context-menu li {
  padding: 5px 15px;
  cursor: pointer;
}

.context-menu li:hover {
  background-color: #f0f0f0;
}
</style>
