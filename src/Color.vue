<!-- ColorPicker.vue -->
<template>
  <div>
    <h1>图片取色器</h1>
    <input type="file" @change="loadImage" />
    <div id="colorDisplay">
      <div :style="{ backgroundColor: hexColor }" id="pickedColor"></div>
      <span id="colorValue">{{ hexColor || '点击图片来取色' }}</span>
    </div>
    <canvas ref="canvas" width="500" height="300" @click="pickColor"></canvas>
  </div>
</template>

<script>
export default {
  data() {
    return {
      hexColor: null,  // 存储选中的颜色
      imageLoaded: false,  // 图片是否已加载
    };
  },
  methods: {
    loadImage(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = this.$refs.canvas;
          const context = canvas.getContext('2d');

          // 清除画布并重新设置画布大小
          context.clearRect(0, 0, canvas.width, canvas.height);
          canvas.width = img.width;
          canvas.height = img.height;

          // 将图片绘制到画布上
          context.drawImage(img, 0, 0);
          this.imageLoaded = true;
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    },
    rgbToHex(r, g, b) {
      return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    },
    pickColor(event) {
      if (!this.imageLoaded) return;

      const canvas = this.$refs.canvas;
      const context = canvas.getContext('2d');
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // 获取点击点的像素数据
      const pixel = context.getImageData(x, y, 1, 1).data;
      const [r, g, b] = pixel;

      // 更新显示的颜色和 HEX 值
      this.hexColor = this.rgbToHex(r, g, b);
    },
  },
};
</script>

<style scoped>
#colorDisplay {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

#pickedColor {
  width: 50px;
  height: 50px;
  border: 1px solid #000;
}
</style>
