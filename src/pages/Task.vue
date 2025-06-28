<template>
  <div>
    <div>
      <div class="task-header">
        <h2>你的任务</h2>
      </div>
      <div class="card" v-for="(task, index) in tasks" :key="task.id">
        <div class="card-description">
          <div :class="{ 'completed': task.finishStatus, 'not-completed': !task.finishStatus }"> <span
              :class="{ 'red': index == 0 && !task.finishStatus }" >{{ task.deadLine }}</span></div>
          <div @click="toHistory(task.id)" class="content">{{ getFrequency(task.eventType) }}{{ task.eventDescription }}</div>
        </div>
        <div class="card-button">

          <div class="start-button" v-if="!task.finishStatus" @click="completeTask(index)">
            <i class="fas fa-check"></i>
          </div>
        </div>
      </div>

    </div>
    <floating-icon v-on:my-event="toggleShareButtons"></floating-icon>
    <loading :visible="loadingVisible" />
    <modal ref="child" />
    <taskDelete ref="deleteChild" />
    <calendar ref="calendarChild" />

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
import Loading from './components/Loading.vue'
import Modal from './components/Modal.vue'
import TaskDelete from './components/TaskDelete.vue'
import Calendar from './components/Calendar.vue'
import FloatingIcon from "./components/FloatingIcon.vue";
const baseUrl = import.meta.env.VITE_APP_API_URL
export default {
  components: {
    Loading,
    Modal,
    FloatingIcon,
    TaskDelete,
    Calendar
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
      shareButtonsVisible: true,
      editingTask: {
        description: '',
        deadline: ''
      }
    };
  },
  created() {
    this.getTask();
    this.clockin();
  },
  methods: {
    getTask() {
    
      const url = 'https://clock.cuiyi.club/openapi/clocks/page?pageSize=100'
      // const url = 'http://localhost:8080/articles/list?category='+ this.eventName + '&pageSize=100'
      axios.get(url).then(response => {
        console.log(response.data);
        if (response.data.code == '22001') {
          localStorage.clear();
          window.location = '/task';
          return;
        }
        this.tasks = response.data.data.list;
        setTimeout(() => {
          this.loadingVisible = false
        }, 1 * 1000)
      }).catch(error => {
        console.error(error);
      });
    },
    toAdd() {
      this.$refs.child.openModal();
    },
    toDelete() {
      this.$refs.deleteChild.openModal();
    },
    toHistory(id) {
      this.$refs.calendarChild.openModal(id);
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
      axios.post('https://clock.cuiyi.club/openapi/clocks/rollback', {})
        .then(response => {
          this.getTask();
        })
        .catch(error => {
          console.log(error)
        })

    },
    report() {
      axios.post('https://clock.cuiyi.club/openapi/report', {})
        .then(response => {
        })
        .catch(error => {
          console.log(error)
        })
    },
    clockin() {
      axios.post('https://clock.cuiyi.club/openapi/clocks/clockin', {})
        .then(response => {
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

.completed {
  color: green;
}

.not-completed {
  color: black;
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

.float-share-button {
  position: fixed;
  bottom: 90px;
  right: 20px;
  background-color: #4CAF50;
  color: white;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.float-exchange-button {
  position: fixed;
  bottom: 150px; // 往上移动
  right: 20px;
  background-color: #2196F3;
  color: white;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.float-trash-button {
  position: fixed;
  bottom: 210px; // 更高，避免和前两个重叠
  right: 20px;
  background-color: #f44336;
  color: white;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

</style>
