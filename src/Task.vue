<template>
  <div class="background-image">
  <div class="task-list ">
    <div class="task-header">
      <h2>任务列表</h2>
    </div>
    <div class="task-table">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>描述</th>
            <th>截止时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(task, index) in tasks" :key="task.id" :class="{ 'completed': task.finishStatus, 'not-completed': !task.finishStatus  }"
            @hold="showConfirm(task)">
            <td>{{ index + 1 }}</td>
            <td>{{ getFrequency(task.eventType) }}{{ task.eventDescription }}</td>
            <td >{{ task.deadLine }}</td>
            <td>

              <div class="start-button" v-if="!task.finishStatus" @click="completeTask(index)">
                <i class="fas fa-check"></i>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
  <floating-icon v-on:my-event="toggleShareButtons"></floating-icon>
  <loading :visible="loadingVisible" />
  <modal ref="child"/>
  <taskDelete ref="deleteChild"/>

  <div class="share-buttons" :style="{ display: shareButtonsVisible ? 'flex' : 'none' }">
    <div class="float-share-button" @click="rollback">
      <i class="fas fa-reply"></i>
    </div>

    <div class="float-exchange-button" @click="toAdd">
        <i class="fas fa-plus"></i>
    </div>

    <div class="float-trash-button" @click="toDelete">
        <i class="fas fa-trash"></i>
    </div>



  </div>

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
      const url = 'https://clock.cuiyi.club/openapi/clocks/page?pageSize=100'
      // const url = 'http://localhost:8080/articles/list?category='+ this.eventName + '&pageSize=100'
      axios.get(url).then(response => {
        this.tasks = response.data.data.list;
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
      axios.post('https://clock.cuiyi.club/openapi/clocks/rollback', { })
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
      axios.post('https://clock.cuiyi.club/openapi/clocks/finish', { clockId: this.tasks[index].id })
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
  color: yellow;
}

.not-completed {
  color: white;
}

.task-list {
  padding: 2rem;

}

.task-table {
  margin-top: 20px;
}

.task-table table {
  width: 100%;
  border-collapse: collapse;
}

.task-table th,
.task-table td {
  text-align: center;
  padding: 10px 10px;
  font-weight: bold;
  text-stroke: 1px red;
-webkit-text-stroke: 1px black; /* Safari 和 Chrome 的前缀*/

}

.task-header {
  text-align: center;
  margin-bottom: 20px;
}

.task-form {
  margin-top: 20px;
}

.task-form form {
  display: flex;
  flex-direction: column;
}

.task-form label {
  margin-bottom: 10px;
}

.task-form button {
  margin-top: 10px;
}

.start-button {
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  /* added to remove the highlight on mobile devices */
}

.float-trash-button {
  position: fixed;
  bottom: 20px;
  right: 200px;
  background-color: lightblue;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  /* added to remove the highlight on mobile devices */
}

</style>
