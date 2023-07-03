<template>
  <div class="background-image">

  <div class="task-list " v-for="(fuckyou, ss) in tasks" >
    <div class="task-header">
      <h2>{{ fuckyou.title }}</h2>
    </div>
    <div class="mygame" v-for="(task, index) in fuckyou.games" :key="task.id" >
      <div> {{ index + 1 }} - {{ task.playTime }} </div>
      <div :class="{ 'completed': task.china  }"> {{ task.playerOne }} vs {{ task.playerTwo }} </div>
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
    this.getTask();
  },
  methods: {
    getTask() {
      const token = localStorage.getItem('puzzle-token');
      // 如果 myData 的值不存在，则将默认值 'hello world' 存入 localStorage 中
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      }
      const url = 'https://chengapi.yufu.pub/openapi/tennis/page?pageSize=1000'
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
    toAdd(){
      this.$refs.child.openModal();
    },
    toDelete(){
      this.$refs.deleteChild.openModal();
    },
    addTask() {
      const newId = Math.max(...this.tasks.map(task => task.id)) + 1;
      this.tasks.push({
        id: newId,
        description: this.newTask.description,
        deadline: this.newTask.deadline,
        completed: false
      });
      this.newTask.description = '';
      this.newTask.deadline = '';
    },
    editTask(index) {
      this.editing = true;
      this.editingIndex = index;
      this.editingTask.description = this.tasks[index].description;
      this.editingTask.deadline = this.tasks[index].deadline;
    },
    saveTask() {
      this.tasks[this.editingIndex].description = this.editingTask.description;
      this.tasks[this.editingIndex].deadline = this.editingTask.deadline;
      this.editing = false;
    },
    rollback() {
      this.loadingVisible = true
      axios.post('https://chengapi.yufu.pub/openapi/clocks/rollback', { })
        .then(response => {
          this.getTask();
        })
        .catch(error => {
          console.log(error)
        })

    },
    getFrequency(eventType) {
      if (eventType === 1) {
        return "每天";
      } else if (eventType === 4) {
        return "每周";
      }
    },
    toggleShareButtons() {
  this.shareButtonsVisible = !this.shareButtonsVisible;
},
    completeTask(index) {
      this.loadingVisible = true
      axios.post('https://chengapi.yufu.pub/openapi/clocks/finish', { clockId: this.tasks[index].id })
        .then(response => {
          this.getTask();
        })
        .catch(error => {
          console.log(error)
        })

    }
  }
};
</script>

<style lang="scss">


.background-image {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('./assets/road.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.completed {
  color: red;
}

.not-completed {
  color: white;
}

.task-list {
  padding: 2rem;

}
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
