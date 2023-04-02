<template>
    <div class="modal" v-if="showModal">
  
        <div class="modal-content" :style="{ maxWidth: '300px', minWidth: '300px' }">
            <div class="modal-header">
                <h3>英雄榜</h3>
                <span class="close" @click="closeModal">&times;</span>
            </div>
            <div class="modal-body">
                <table v-if="listData.length">
                    <thead>
                        <tr>
                            <th>排名</th>
                            <th>名称</th>
                            <th>时间</th>
                            <th>步数</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in listData" :key="index">
                            <td>{{ index + 1}}</td>
                            <td>{{ item.username }}</td>
                            <td>{{ item.spendTime }}</td>
                            <td>{{ item.step }}</td>
                        </tr>
                    </tbody>
                </table>
                <p v-else>暂无数据</p>
            </div>
        </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
        listData: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            showModal: false
        }
    },
    methods: {
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
  .modal table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
    margin-left: auto;
    margin-right: auto;
  }
  
  .modal th,
  .modal td {
    text-align: center;
    padding: 10px;
  }
  </style>
  
  