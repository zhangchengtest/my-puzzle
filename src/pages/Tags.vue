<template>
  <div>
    <!-- 添加按钮 -->
    <button class="add-btn" @click="addDiv">添加新块</button>
    <button class="add-margin-btn" @click="addTopMargin">顶部加50px空白</button>

    <!-- 可拖拽的块 -->
    <div
      v-for="(item, index) in divs"
      :key="item.id"
      @click="selectDiv(index)"
      @mousedown="startDrag($event, index)"
      @touchstart="handleTouchStart($event, index)"
      @dblclick="editInline(index)"
      :style="{
        left: `${item.position.left}px`,
        top: `${item.position.top}px`,
        backgroundColor: item.color,
        borderRadius: item.borderRadius,
        width: item.width + 'px',
        height: 'auto',
        padding: '10px'
      }"
      class="draggable"
    >
      <div v-if="!item.editing">{{ item.text }}</div>
      <textarea v-else
                v-model="item.text"
                @blur="saveEdit(index)"
                @keydown.enter.prevent="saveEdit(index)"
                class="inline-textarea"
                rows="3" />
    </div>

    <!-- 浮动操作按钮 -->
    <div v-if="selectedIndex !== null" class="floating-menu">
      <button @click="removeDiv(selectedIndex)">删除</button>
      <button @click="copyContent(selectedIndex)">复制</button>
      <button @click="duplicateDiv(selectedIndex)">复制粘贴</button>
      <button @click="enlargeDiv(selectedIndex)">放大</button>
  <button @click="shrinkDiv(selectedIndex)">缩小</button>
    </div>

    <Toast ref="toast" />
  </div>
</template>

<script>
import Toast from './components/Toast.vue';

export default {
  components: { Toast },
  data() {
    return {
      isDragging: false,
      offsetX: 0,
      offsetY: 0,
      draggingIndex: null,
      dragged: false,
      divs: JSON.parse(localStorage.getItem('divs')) || [],
      selectedIndex: null,
      lastTouchTime: 0,
    };
  },
  methods: {
    addTopMargin() {
      this.divs.forEach(div => {
        div.position.top += 50;
      });
      this.saveDivs();
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
      const borderRadius = Math.random() < 0.5 ? `${Math.floor(Math.random() * 50)}%` : '0%';
      return { borderRadius };
    },
    randomWidth() {
      return Math.floor(Math.random() * 150 + 100);
    },
    addDiv() {
      const newDiv = {
        id: Date.now(),
        text: '拖拽我',
        editing: false,
        position: { left: 100, top: 100 },
        color: this.randomColor(),
        width: this.randomWidth(),
        ...this.randomStyle()
      };
      this.divs.push(newDiv);
      this.saveDivs();
    },
    startDrag(e, index) {
      if (this.divs[index].editing) return;
      e.preventDefault();
      this.isDragging = true;
      this.dragged = false;
      this.offsetX = (e.clientX || e.touches?.[0]?.clientX) - this.divs[index].position.left;
      this.offsetY = (e.clientY || e.touches?.[0]?.clientY) - this.divs[index].position.top;
      this.draggingIndex = index;

      if (e.type === 'mousedown') {
        document.onmousemove = this.onDrag;
        document.onmouseup = this.stopDrag;
      } else if (e.type === 'touchstart') {
        document.ontouchmove = this.onDrag;
        document.ontouchend = this.stopDrag;
      }

      document.body.style.userSelect = 'none';
    },
    onDrag(e) {
      if (this.isDragging && this.draggingIndex !== null) {
        this.dragged = true;
        const item = this.divs[this.draggingIndex];
        const clientX = e.clientX || e.touches?.[0]?.clientX;
        const clientY = e.clientY || e.touches?.[0]?.clientY;

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
      this.selectedIndex = null;
    },
    saveDivs() {
      localStorage.setItem('divs', JSON.stringify(this.divs));
    },
    handleTouchStart(e, index) {
      if (this.isDragging) return;
      const currentTime = Date.now();
      const timeDifference = currentTime - this.lastTouchTime;

      if (timeDifference < 300) {
        this.selectDiv(index);  
      }

      this.lastTouchTime = currentTime;
    },
    editInline(index) {
      this.divs[index].editing = true;
      this.selectedIndex = index;
    },
    saveEdit(index) {
      this.divs[index].editing = false;
      this.saveDivs();
    },
    copyContent(index) {
      const textToCopy = this.divs[index].text;
      navigator.clipboard.writeText(textToCopy).then(() => {
        this.showToast('内容已复制到剪贴板！');
      }).catch(err => {
        alert('复制失败: ' + err);
      });
    },
    enlargeDiv(index) {
      this.divs[index].width += 20;
      this.divs[index].height += 20;
      this.saveDivs();
    },
    shrinkDiv(index) {
      const minWidth = 50;
      if (this.divs[index].width <= minWidth) {
        this.showToast('已经是最小尺寸了！');
        return;
      }
      this.divs[index].width -= 20;
      this.divs[index].height -= 20;
      this.saveDivs();
    },

    duplicateDiv(index) {
      const original = this.divs[index];
      const newDiv = {
        ...JSON.parse(JSON.stringify(original)),
        id: Date.now(),
        position: {
          left: original.position.left + 30,
          top: original.position.top + 30
        }
      };
      this.divs.push(newDiv);
      this.saveDivs();
      this.showToast('已复制一个新块！');
    },
    selectDiv(index) {
      this.selectedIndex = index;
    },
    clearSelection(e) {
      const ignore = e.target.closest('.draggable') || e.target.closest('.floating-menu');
      if (!ignore) {
        this.selectedIndex = null;
      }
    }
  },
  mounted() {
    document.addEventListener('mousedown', this.clearSelection);
  },
  beforeDestroy() {
    document.removeEventListener('mousedown', this.clearSelection);
  }
};
</script>

<style scoped>
.add-margin-btn {
  position: fixed;
  bottom: 100px;
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
  word-wrap: break-word;
  white-space: normal;
  width: auto;
  height: auto;
  min-width: 100px;
  min-height: 50px;
  padding: 10px;
}
.inline-textarea {
  width: 100%;
  height: auto;
  min-height: 60px;
  box-sizing: border-box;
  resize: none;
  font-size: 14px;
  font-family: inherit;
  border: 1px solid #4CAF50;
  border-radius: 6px;
  padding: 5px;
}
.floating-menu {
  position: fixed;
  bottom: 30px;
  left: 30px;
  background: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 10px;
  display: flex;
  gap: 10px;
  z-index: 200;
}
.floating-menu button {
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
}
.floating-menu button:hover {
  background-color: #1976D2;
}
</style>
