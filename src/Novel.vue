<template>
    <div >
      <h2>{{ title }}</h2>
      <p v-html="content"></p>
      <button @click="refresh">刷新</button>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
import Loading from '@/components/Loading.vue'
  export default {
    components: {
        Loading
    },
    data() {
      return {
        loadingVisible: true,
        title: '', // 小说标题
        content: '' // 小说内容
      }
    },
  
    mounted() {
      this.getNovelData();
    },
  
    methods: {
      // 获取小说数据的方法
      getNovelData() {

        this.loadingVisible = true
        axios.get('https://api.punengshuo.com/api/game/randomNovel')
            .then(response => {
                this.title = response.data.data.title
                this.content = response.data.data.content
            setTimeout( () => {
                this.loadingVisible = false
            }, 3 * 1000 )
            })
            .catch(error => {
            console.log(error)
            })
       
      },
  
      // 刷新按钮点击事件
      refresh() {
        this.getNovelData();
      }
    }
  }
  </script>
  
  <style>

  button {
    font-size: 1rem;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    background-color: #6c63ff;
    color: white;
    cursor: pointer;
    transition: all 0.3s;
  }
  
  button:hover {
    background-color: #524dbd;
  }
  
  button:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(108, 99, 255, 0.5);
  }
  </style>
  