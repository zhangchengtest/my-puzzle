<template>
  <div>
    <h1>优惠券抢购</h1>
    <label for="userId">用户编号:</label>
    <input type="text" v-model="userId" placeholder="输入用户编号" />
    <label for="couponId">优惠券编号:</label>
    <input type="text" v-model="couponId" placeholder="输入优惠券编号" />
    <button @click="startSeckill" :disabled="countdown > 0 || isSeckillInProgress">开始抢购</button>
    <p v-if="message">{{ message }}</p>
    <p v-if="countdown > 0">距离抢购开始还有 {{ countdown }} 秒</p>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      userId: '',
      couponId: '',
      message: '',
      requestId: '',
      countdown: 0,  // 用于显示离抢购开始的倒计时
      isSeckillInProgress: false,
      countdownInterval: null,
    };
  },
  methods: {
    // 计算距离18点的秒数
    calculateCountdown() {
      const now = new Date();
      const targetTime = new Date(now);
      targetTime.setHours(11, 3, 0, 0);  // 设置目标时间为18点整

      // 如果当前时间已经超过18点，设置为第二天的18点
      // if (now >= targetTime) {
      //   targetTime.setDate(targetTime.getDate() + 1);  // 设置为第二天的18点
      // }

      const remainingTime = targetTime.getTime() - now.getTime();  // 毫秒
      this.countdown = Math.floor(remainingTime / 1000); // 转换成秒
    },

    // 启动抢购
    startSeckill() {
      this.isSeckillInProgress = true;
      this.seckill(); // 秒杀请求
    },

    // 秒杀请求
    async seckill() {
      try {
        const response = await axios.post('https://clock.cuiyi.club/openapi/coupons/seckill', null, {
          params: { userId: this.userId, couponId: this.couponId }
        });
        console.log(response)
        console.log(response.data)
        this.requestId = response.data.data;
        console.log(this.requestId)
        this.message = `请求已提交，编号: ${this.requestId}`;
        this.pollResult();
      } catch (error) {
        this.message = '秒杀失败: ' + error.response.data;
      }
    },

    // 轮询获取秒杀结果
    async pollResult() {
      const interval = setInterval(async () => {
        try {
          const response = await axios.get('https://clock.cuiyi.club/openapi/coupons/result', {
            params: { requestId: this.requestId }
          });
          this.message = response.data;
          clearInterval(interval);
        } catch (error) {
          if (error.response.status === 404) {
            console.log('结果尚未生成，继续轮询...');
          } else {
            this.message = '获取结果失败: ' + error.response.data;
            clearInterval(interval);
          }
        }
      }, 1000);
    },

    // 开始倒计时
    startCountdown() {
      this.countdownInterval = setInterval(() => {
        if (this.countdown > 0) {
          this.countdown--;  // 每秒减少倒计时
        } else {
          clearInterval(this.countdownInterval);  // 倒计时结束，清除定时器
        }
      }, 1000);
    },
  },
  created() {
    this.calculateCountdown();  // 初始化计算倒计时
    this.startCountdown();  // 启动倒计时
  },
  beforeDestroy() {
    // 清除倒计时定时器
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
};
</script>

<style scoped>
input {
  margin-right: 10px;
}
button {
  margin-left: 10px;
}
</style>
