<template>
    <div class="modal" v-if="showModal">
  
        <div class="modal-content" :style="{ maxWidth: '300px', minWidth: '300px' }">
            <div class="modal-header">
                <h3>新增</h3>
                <span class="close" @click="closeModal">&times;</span>
            </div>
            <div class="modal-body">
              <form>
        <div>
          <label>频率：</label>
          <select v-model="eventType">
            <option value="1">每天</option>
            <option value="4">每周</option>
          </select>
        </div>
        <div>
          <label>时间：</label>
          <input type="text" v-model="notifyDate">
        </div>
        <div>
          <label>描述：</label>
          <input type="text" v-model="eventDescription">
        </div>
        <div>
          <button type="submit" @click.prevent="addTask()">保存</button>
          <button type="button" @click="showModal = false">取消</button>
        </div>
      </form>
            </div>
        </div>
    </div>
  </template>
  
  <script>
    import axios from 'axios'
  export default {
    props: {
        listData: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
          eventType: '1',
          notifyDate: '',
          eventDescription: '',
            showModal: false
        }
    },
    methods: {
        addTask() {
          const token = localStorage.getItem('puzzle-token');
      // 如果 myData 的值不存在，则将默认值 'hello world' 存入 localStorage 中
          if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
          }
          axios.post('https://chengapi.yufu.pub/openapi/clocks/add', { eventType: this.eventType, notifyDate: this.notifyDate,eventDescription: this.eventDescription })
        .then(response => {
          location.reload()
        })
        .catch(error => {
          console.log(error)
        })
        },
        openModal() {
            this.showModal = true;
        },
        closeModal() {
            this.showModal = false;
        },
    },
  };
  </script>
  
  <style>
  .modal {
    overflow: hidden;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .modal-content {
    background-color: white;
    padding: 20px;
    border-radius: 5px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5);
    height: 300px;
    overflow: hidden;
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .modal-header h3 {
    margin: 0;
  }
  
  .modal-header button {
    background-color: transparent;
    border: none;
    font-size: 20px;
    cursor: pointer;
  }
  
  /* The following styles are for the table inside the modal */
  .modal div {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
    margin-left: auto;
    margin-right: auto;
  }

   /*控制标签样式*/
   label {
    display: inline-block;
    width: 100px;
  }
  
  /*控制下拉列表和输入框样式*/
  select, input[type="text"] {
    display: inline-block;
    box-sizing: border-box;
  width: 100%;
    height: 30px;
    border: 1px solid #ccc;
    border-radius: 3px;
    padding: 0 10px;
    font-size: 14px;
    color: #333;
  }
  
  /*控制保存和取消按钮样式*/
  button[type="submit"], button[type="button"] {
    display: inline-block;
    width: 80px;
    height: 30px;
    margin-left: 50px;
    border: 1px solid #ccc;
    border-radius: 3px;
    background-color: #f5f5f5;
    cursor: pointer;
    font-size: 14px;
    color: #333;
  }
  
  /*控制保存按钮鼠标悬停样式*/
  button[type="submit"]:hover {
    background-color: #ddd;
  }
  
  /*控制取消按钮鼠标悬停样式*/
  button[type="button"]:hover {
    background-color: #eee;
  }


  </style>
  
  