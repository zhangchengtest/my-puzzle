<!-- components/MultiLineInput.vue -->
<template>
  <div class="overlay" v-if="visible">
    <div class="modal">
      <h3>请输入内容：</h3>
      <textarea v-model="inputText" rows="8" placeholder="请输入多行内容..."></textarea>
      <div class="buttons">
        <button @click="confirm">确认</button>
        <button @click="cancel">取消</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      visible: false,
      inputText: '',
      resolve: null,
    };
  },
  methods: {
    open(defaultText = '') {
      this.inputText = defaultText;
      this.visible = true;
      return new Promise((resolve) => {
        this.resolve = resolve;
      });
    },
    confirm() {
      this.visible = false;
      this.resolve(this.inputText);
    },
    cancel() {
      this.visible = false;
      this.resolve(null);
    }
  }
};
</script>

<style scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}
.modal {
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 600px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
}
textarea {
  width: 80%;
  padding: 10px;
  resize: vertical;
}
.buttons {
  margin-top: 10px;
  text-align: right;
}
button {
  margin-left: 10px;
}
</style>
