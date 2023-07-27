<!-- CardList.vue -->
<template>
    <div>
      <template v-for="(card, index) in cards" :key="card.id">
        <div class="card">
          <div class="card-description">
            <div > <span :class="{ 'red': index == 0}" class="deadline" >{{ card.deadline }}</span></div>
            <div class="content">{{ card.description }}</div>
          </div>
          <div class="card-button">
            

            <div class="start-button"  @click="completeTask(index)">
                <i class="fas fa-check"></i>
            </div>
          </div>
        </div>
      </template>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        cards: [
          { id: 1, description: '任务1---------------------------', deadline: '2023-08-01' },
          { id: 2, description: '任务2', deadline: '2023-08-05' },
          // ...
        ]
      };
    },
    methods: {
      handleCheckIn(cardId) {
        // 处理打卡按钮点击事件
        console.log(`打卡卡片 ${cardId}`);
        // 添加你的逻辑代码
      }
    }
  };
  </script>
  
  <style>
  body{
    background-color: azure;
  }
  /* styles.css */
  .card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 10px;
    min-width: 300px;

    padding: 10px 14px;
    background-color: white;
    border-radius: 10px;

    box-shadow: 0px 2px 4px 0px rgba(0,0,0,.05);
    transition: background-color .3s ease;
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    user-select: none;
    border: 2px solid transparent;
    position: relative;

  }
  
  .card-description {
   
    flex: 1;
    text-align: left;
  }
.red{
      color: red;
  }
  .content{
      font-size: 14px;
  }
  
  .card-button {
    margin-left: 10px;
  }
  </style>
  