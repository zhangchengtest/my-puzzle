<template>
  <div class="calendar-modal" v-if="showModal">

    <div class="calendar-modal-content">
      <div class="calendar-modal-header">
        <div>&nbsp;</div>
        <span class="calendar-close" @click="closeModal">&times;</span>
      </div>
      <div class="calendar-modal-body">
        <div>
          <div class="calendar">
            <div class="calendar-header">
              <div class="mybutton" @click="previousMonth">&lt;</div>
              <div class="month">{{ currentMonth }}</div>
              <div class="mybutton" @click="nextMonth">&gt;</div>
            </div>
            <div class="calendar-body">
              <div class="days-of-week">
                <div v-for="day in daysOfWeek" :key="day" class="day">{{ day }}</div>
              </div>
              <div class="dates">

                <div v-for="date in visibleDates" :key="date"
                  :class="{ 'date': true, 'signed': signedDates.includes(date), 'gray': !isPastDate(date)}">

                  <div v-if="isPastDate(date) && !signedDates.includes(date)" @click="append(date)">
                    {{ date }}
                  </div>

                  <div  v-else>
                    {{ date }}
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
  
<script>
import axios from 'axios';
export default {
  data() {
    return {
      currentMonth: "",
      today: null,
      clockId: "",
      visibleDates: [],
      showModal: false,
      signedDates: ["1", "5", "6"] // 示例已签到的日期
    };
  },
  computed: {
    daysOfWeek() {
      return ["日", "一", "二", "三", "四", "五", "六"];
    }
  },
  methods: {
    previousMonth() {
      // 在此编写逻辑以获取前一个月的日期并更新数据
    },
    isPastDate(date) {
      const formatteddate = date < 10 ? "0" + date : date;
      const day = this.currentMonth + "-" + formatteddate;
      const selectedDate = new Date(day);
      return selectedDate <= this.today;
    },
    loadData() {
      var token = localStorage.getItem('puzzle-token');
      // 如果 myData 的值不存在，则将默认值 'hello world' 存入 localStorage 中

      const url = 'https://clock.cuiyi.club/openapi/clocks/history?clockId=' + this.clockId + "&month=" + this.currentMonth
      // const url = 'http://localhost:8080/articles/list?category='+ this.eventName + '&pageSize=100'
      axios.get(url).then(response => {
        console.log(response.data);

        this.signedDates = response.data.data;
        setTimeout(() => {
          this.loadingVisible = false
        }, 1 * 1000)
      }).catch(error => {
        console.error(error);
      });
    },
    openModal(clockId) {
      this.clockId = clockId;
      this.loadData();

      this.showModal = true;
    },
    append(date) {

      this.loadingVisible = true
      const formatteddate = date < 10 ? "0" + date : date;
      const day = this.currentMonth + "-" + formatteddate;
      axios.post('https://clock.cuiyi.club/openapi/clocks/append', { clockId: this.clockId, day })
        .then(response => {
          this.loadData();
        })
        .catch(error => {
          console.log(error)
        })

      console.log(day);
    },
    closeModal() {
      this.showModal = false;
    },
    nextMonth() {
      // 在此编写逻辑以获取下一个月的日期并更新数据
    },
    // 示例逻辑，计算指定月份的日期数组
    getVisibleDates(year, month) {
      const firstDay = new Date(year, month - 1, 1);
      const lastDay = new Date(year, month, 0);
      const dates = [];
      for (let i = 0; i < firstDay.getDay(); i++) {
        dates.push("");
      }
      for (let i = 1; i <= lastDay.getDate(); i++) {
        dates.push("" + i);
      }

      return dates;
    }
  },
  mounted() {
    // 获取当前月份的日期并更新数据
    const currentDate = new Date();
    this.today = currentDate;
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const formattedMonth = month < 10 ? "0" + month : month;
    this.currentMonth = year + "-" + formattedMonth;
    //TODO 将currentMonth改成yyyy-MM这种格式
    // 在此编写逻辑以获取指定月份的可见日期
    // 可以使用第三方库或自己实现一个函数来计算某个月份的日期数组
    this.visibleDates = this.getVisibleDates(year, month);
  },
};
</script>
  
<style>
.calendar-close {
  font-size: 20px;
}

.calendar-modal {
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

.calendar-modal-content {
  background-color: white;
  border-radius: 5px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5);
  width: 90%;
}

.calendar-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 20px;
  padding-top: 10px;
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

.calendar {
  /* border: 1px solid #ccc; */
  margin: 0 20px;
  padding: 10px;
}

.calendar-header {
  text-align: center;
  display: flex;
}

.calendar-header .mybutton {
  flex: 1;
}

.calendar-header .month {
  font-size: 20px;
  font-weight: bold;
  text-transform: uppercase;
  flex: 1;
}

.days-of-week {
  display: flex;
}

.day {
  flex: 1;
  padding: 5px;
  text-align: center;
}

.dates {
  display: grid;
  grid-template-columns: repeat(7, 1fr);

}

.date {
  background: #eee;
  border: 1px solid #ccc;
  cursor: pointer;
  padding: 5px;
  text-align: center;
}

.signed {
  background: green;
  color: white;
}
.gray {
  background: gray;
  color: white;
}
</style>
  