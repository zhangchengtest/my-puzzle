<template>
  <transition name="fade">
    <div v-if="visible" class="toast">{{ message }}</div>
  </transition>
</template>

<script>
export default {
  data() {
    return {
      visible: false,
      message: '',
      timeout: null,
    };
  },
  methods: {
    show(msg, duration = 2000) {
      this.message = msg;
      this.visible = true;

      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        this.visible = false;
      }, duration);
    }
  }
}
</script>

<style scoped>
.toast {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.75);
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  z-index: 9999;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
