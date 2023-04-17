<template>
  <div > {{eventName}}</div>
  <div >
    <ul>
      <li v-for="event in events" :key="event.id">
        <div class="timeline"> 
          <span class="circle" :class="getCircleClass(event.content)"></span>
          <span><img :src="event.avatar" class="logo" /></span>
          <div class="event">
          <div class="content">
            <div class="date">{{ event.title }}</div>
            <div class="myitem">
             <!-- <div class="inner-content">{{ event.content }}</div> -->
             <p class="inner-content" v-html="processedContent(event.content)"></p>
            </div>
           
           
          </div>
        </div>

        </div>
       
      </li>
    </ul>
  </div>
</template>

<style>

.inner-content {
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.logo{
  width: 16px;
  height: 16px;
  margin-bottom: -10px;
  position: absolute;
  left: -28px;
  top: 58px;
}


.timeline::before {
  content: "";
  position: absolute;
  top: 0;
  left: -20px;
  transform: translateX(-50%);
  width: 2px;
  height: 100%;
  background-color: black;
}
.timeline {
  position: relative;
  display: flex;
  align-items: center;
}

.circle {
  position: absolute;
  left: -20px;
  top: 10px;
  transform: translateX(-50%);
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
}

.circle-red{
  background-color: red;
}

.circle-black{
  background-color: black;
}

.event {
  position: relative;
  display: flex;
  align-items: center;
  /* margin-bottom: 2rem; */
}

.content {
  flex: 1;
  width: 280px;
  /* display: flex; */
  /* flex-direction: column; */
  /* border: 1px solid lightblue; */
  border-radius: 10px;
  margin-top: 10px;
  text-align: left; /* 将文本左对齐 */
}

.date {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.85rem;
  font-weight: bold;
  color: #999999;
  /* border: 1px solid lightblue;
  border-radius: 10px; */
  
}

ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
</style>

<script>
import axios from 'axios';
export default {
  data() {
    return {
      eventName: '白马山庄',
      events: [
       
      ],
    };
  },
  methods: {
    processLink(link) {
      return `<a href="${link}">${link}</a>`
    },
    getCircleClass(item) {
      if (!item) {
        return 'circle-red';
      } else {
        return 'circle-black';
      }
    }
    
  },
  computed: {
    processedContent() {
      return function(content) {
        const regex = /(\b(https?|ftp):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:/~+#-]*[\w@?^=%&amp;/~+#-])?)/g;
        if(!content){
          return '';
        }
        this.content = content.replace(regex, this.processLink)
        this.content = this.content.replace(/\n/g, '<br>');
        return this.content;
      }
    }
  },
  created() {
    this.eventName = this.$route.query.eventName;
  const url = 'https://chengapi.yufu.pub/openapi/articles/list?category='+ this.eventName + '&pageSize=100'
  // const url = 'http://localhost:8080/articles/list?category='+ this.eventName + '&pageSize=100'
  axios.get(url).then(response => {
      this.events = response.data.data;
    }).catch(error => {
      console.error(error);
    });
  }
};
</script>
