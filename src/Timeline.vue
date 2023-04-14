<template>
  <div > {{eventName}}</div>
  <div >
    <ul>
      <li v-for="event in events" :key="event.id">
        <div class="timeline"> 
          <span class="circle"></span>
          <div class="event">
          <div class="content">
            <div class="date">{{ event.createDate }}</div>
            <p>{{ event.content }}</p>
          </div>
        </div>

        </div>
       
      </li>
    </ul>
  </div>
</template>

<style>

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
  background-color: #000000;
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
  created() {
    this.eventName = this.$route.query.eventName;
  const url = 'https://chengapi.yufu.pub/openapi/articles/page?category='+ this.eventName + '&pageSize=10'
  axios.get(url).then(response => {
      this.events = response.data.data.list;
    }).catch(error => {
      console.error(error);
    });
  }
};
</script>
