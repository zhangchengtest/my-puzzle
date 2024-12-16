<template>
  <div class="background-image">

  <div class="task-list " v-for="(fuckyou, ss) in tasks" >
    <div class="task-header">
      <h2>{{ fuckyou.title }}</h2>
    </div>
    <div class="mygame" v-for="(task, index) in fuckyou.games" :key="task.id" >
      <div> {{ index + 1 }} - {{ task.playTime }} </div>
      <div :class="{ 'completed': task.china  }"> {{ task.playerOne }} vs {{ task.playerTwo }} </div>
      <div > {{ task.playerOrder1 }} vs {{ task.playerOrder2 }} </div>
      <div > {{ task.history }} </div>
      <div> {{ task.odd1 }} - {{ task.odd2 }} </div>
      <div class="task-table">
      <div class="parent">

  <div class="flex-child">{{ task.oneScore1 }}</div>
  <div class="flex-child">{{ task.oneScore2 }}</div>
  <div class="flex-child">{{ task.oneScore3 }}</div>
  <div class="flex-child">{{ task.oneScore4 }}</div>
  <div class="flex-child">{{ task.oneScore5 }}</div>
  <div class="flex-child">{{ task.oneScore6 }}</div>
</div>
<div class="parent">
  <div class="flex-child">{{ task.twoScore1 }}</div>
  <div class="flex-child">{{ task.twoScore2 }}</div>
  <div class="flex-child">{{ task.twoScore3 }}</div>
  <div class="flex-child">{{ task.twoScore4 }}</div>
  <div class="flex-child">{{ task.twoScore5 }}</div>
  <div class="flex-child">{{ task.twoScore6 }}</div>
</div>

    </div>
    

    </div>

  </div>

  <floating-icon v-on:my-event="toggleShareButtons"></floating-icon>
  <loading :visible="loadingVisible" />
  <modal ref="child"/>

</div>
</template>

<script>
import axios from 'axios';
import Loading from '@/components/Loading.vue'
import Modal from '@/components/Modal.vue'
import TaskDelete from '@/components/TaskDelete.vue'
import FloatingIcon from "@/components/FloatingIcon.vue";
export default {
  components: {
    Loading,
    Modal,
    FloatingIcon,
    TaskDelete
},
  data() {
    return {
      tasks: [

      ],
      newTask: {
        description: '',
        deadline: ''
      },
      loadingVisible: true,
      editing: false,
      editingIndex: null,
      shareButtonsVisible:false,
      editingTask: {
        description: '',
        deadline: ''
      }
    };
  },
  created() {
    this.loadData();
    this.startTimer(); // 启动定时器
  },
  methods: {
    
    loadData() {
      const url = 'https://clock.cuiyi.club/openapi/tennis/page?pageSize=1000'
      // const url = 'http://localhost:8080/articles/list?category='+ this.eventName + '&pageSize=100'
      axios.get(url).then(response => {
        this.tasks = response.data.data;
        setTimeout(() => {
          this.loadingVisible = false
        }, 1 * 1000)
      }).catch(error => {
        console.error(error);
      });
    },
    startTimer() {
      this.intervalId = setInterval(() => {
        this.loadData(); // 每隔30秒重新加载数据
      }, 10000);
    },
    stopTimer() {
      clearInterval(this.intervalId); // 停止定时器
    }
  },
  beforeDestroy() {
    this.stopTimer(); // 组件销毁前停止定时器，避免内存泄漏
  }
};
</script>

<style lang="scss">

.mygame{
  margin-top: 20px;
}

.parent {
  display: flex;
}

.fixed-width {
  width: 150px; /* 设置固定宽度 */
  text-align: left;
}

.flex-child {
  flex: 1; /* 平分父div剩余空间 */
  border: 1px solid black; /* 仅用于演示目的，可根据需要自定义样式 */
  min-width: 40px;
}


</style>
