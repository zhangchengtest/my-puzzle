<script setup>
import { watch, ref } from 'vue'
import axios from 'axios';
import { Swappable } from '@shopify/draggable'
import { useRoute, useRouter } from 'vue-router'
import Timer from './Timer.vue'
import Loading from './Loading.vue'
import Header from './Header.vue'
import { wexinShare } from '../../assets/common/weixin.js';
const router = useRouter()
const route = useRoute()

const shareButtonsVisible = ref(false);

const popVisible = ref(false);

const loadingVisible = ref(false);

function toggleShareButtons() {
  shareButtonsVisible.value = !shareButtonsVisible.value;
}

function popButton() {
  popVisible.value = true;

}

const hidePopup = () => {
  if (popVisible.value) {
    popVisible.value = false;
  }
}


const imageArray = ref([])

const url = ref(null)

const timer = ref()
const isStart = ref(false)
const step = ref(0)


init()
function init() {
  loadingVisible.value = true
  url.value = route.query.randomUrl
  if (!route.query.randomUrl) {
    toRedirect()
  } else {
    showGame()
    getRank()
  }
}

watch(route, (newValue, oldValue) => {
  // 执行onMounted代码
  url.value = newValue.query.randomUrl
  showGame()
})

function toRedirect() {
  loadingVisible.value = true
  axios.get('https://clock.cuiyi.club/api/game/queryPuzzle')
    .then(response => {
      window.location = 'home?randomUrl=' + response.data.data.url
    })
    .catch(error => {
      console.log(error)
    })
}

function showGame() {
  loadingVisible.value = true
  axios.get('https://clock.cuiyi.club/api/game/queryPuzzleByUrl?order_type=normal&url=' + url.value)
    .then(response => {
      imageArray.value = response.data.data.piecces

      setTimeout(() => {
        loadingVisible.value = false
      }, 3 * 1000)
    })
    .catch(error => {
      console.log(error)
    })
}

function startGame() {
  loadingVisible.value = true
  axios.get('https://clock.cuiyi.club/api/game/queryPuzzleByUrl?order_type=random&url=' + url.value)
    .then(response => {
      imageArray.value = response.data.data.piecces
      timer.value.start()
      isStart.value = true
      swap()
      setTimeout(() => {
        loadingVisible.value = false
      }, 1.5 * 1000)

    })
    .catch(error => {
      console.log(error)
    })
}

const ranks = ref([]);
//http://st.punengshuo.com/images/20230402000000/full.jpg
function getRank() {
  axios.get('https://clock.cuiyi.club/openapi/puzzleRanks/page?&url=' + url.value)
    .then(response => {
      console.log(response.data)
      ranks.value = response.data.data.list
      setTimeout(() => {
        loadingVisible.value = false
      }, 1.5 * 1000)
    })
    .catch(error => {
      console.log(error)
    })
}
//https://clock.cuiyi.club/api/game/savePuzzleRank
function savePuzzleRank(rankData) {
  axios.post('https://clock.cuiyi.club/openapi/puzzleRanks/', rankData)
    .then(response => {
      getRank()
    })
    .catch(error => {
      console.log(error)
    })
}
const swappable = ref()
function stopswap() {
  swappable.value.destroy()
}
function swap() {
  swappable.value = new Swappable(document.querySelectorAll('.puzzle-all'), {
    draggable: 'img',
    delay: 0,
    mirror: {
      constrainDimensions: true
    }
  })
  swappable.value.on('drag:start', () => { })
  swappable.value.on('swappable:swapped', event => {
    // console.log( event.data.dragEvent.source.currentSrc )
    // // console.log( event.swappedElement.currentSrc )
    // var x2 = event.swappedElement.getAttribute( 'showx' )
    // var y2 = event.swappedElement.getAttribute( 'showy' )
    // a.value = x2
    // b.value = y2
  })
  swappable.value.on('drag:stop', event => {
    move()
    // console.log( event )
    // console.log( event.data.source.currentSrc )
    // shouldMove()
  })
  swappable.value.on('drag:move', () => { })
}

function move() {
  if (!isStart.value) return
  step.value = step.value + 1
  var arr = document.querySelectorAll('img')
  var result = ''
  for (var i = 0; i < arr.length; i++) {
    if (arr[i].getAttribute('class') && arr[i].getAttribute('class').includes('draggable-mirror')) {
    } else if (arr[i].getAttribute('class') && arr[i].getAttribute('class').includes('draggable--original')) {
    } else if (arr[i].getAttribute('class') && arr[i].getAttribute('class').includes('popup-img')) {
    } else if (arr[i].getAttribute('class') && arr[i].getAttribute('class').includes('logo-img')) {
    }
    else {
      var s = arr[i]
        .getAttribute('src')
        .substring(len(arr[i].getAttribute('src')) - 5, len(arr[i].getAttribute('src')) - 4)

      result = result + ',' + s
    }
  }
  console.log(result.substring(1, len(result)))
  gameEnd(result.substring(1, len(result)))
}

function len(str) {
  return str.length
}

function gameEnd(result) {
  const target = creatArr(3).toString()
  if (result === target) {
    loadingVisible.value = true
    timer.value.stop()
    stopswap()
    savePuzzleRank({
      spendTime: timer.value.getTime(), step: step.value, username: localStorage.getItem('username'), url: url.value, title: url.value,
      userId: localStorage.getItem('username')
    })
  }
}

// 创建数组
function creatArr(level) {
  const arr = []
  let lin = []
  const levels = level * level + 1

  for (let i = 1; i < levels; i++) {
    lin.push(i)
    if (lin.length === level) {
      arr.push(lin)
      lin = []
    }
  }
  // arr[level - 1][level - 1] = 0
  return arr
}

const refresh = () => {
  step.value = 0
  isStart.value = false
  timer.value.reset()
  toRedirect()
}


function weixin() {
  popButton();
  var urls = window.location.href
  axios.get('https://clock.cuiyi.club/api/wx/share?url=' + urls)
    .then(res => {
      //微信加签
      var obj = {
        appId: res.data.data.appId,
        nonceStr: res.data.data.nonceStr,
        signature: res.data.data.signature,
        timestamp: res.data.data.timestamp,
        jsApiList: ['onMenuShareAppMessage']
      };
      console.log('come weixin1')
      console.log(url.value)
      let shareData = {
        title: '拼图', // 分享标题
        desc: '就是玩',
        link: urls,
        // link: window.location.href,
        imgUrl: '' // 分享图标
      };
      //引用
      wexinShare(obj, shareData);
    })
    .catch(error => {
      console.log(error)
    })
}

</script>

<template>
  <div>
    <Header :visible="loadingVisible"></Header>
    <div style="width: 300px; ${centerDivStyle}" id="container">
      <div style="display: flex; justify-content: space-between;">
        <div id="time" class="time-style">
          <Timer ref="timer"></Timer>
        </div>
        <div id="step" class="step-style">步数：{{ step }}</div>
      </div>
      <div style="margin-top: 10px;" class="puzzle-all">
        <div class="puzzle">
          <div v-for="(image, index) in imageArray.slice(0, 3)" :key="index" class="child" :id="'puzzle-' + (index + 1)">
            <img :src="image" class="puzzle-image">
          </div>


        </div>

        <div class="puzzle">
          <div v-for="(image, index) in imageArray.slice(3, 6)" :key="index" class="child" :id="'puzzle-' + (index + 1)">
            <img :src="image" class="puzzle-image">
          </div>
        </div>

        <div class="puzzle">
          <div v-for="(image, index) in imageArray.slice(6, 9)" :key="index" class="child" :id="'puzzle-' + (index + 1)">
            <img :src="image" class="puzzle-image">
          </div>
        </div>
      </div>


      <div style="display: flex; justify-content: center; margin-top: 10px;">
        <div class="start-button" @click="startGame" :style="{ display: !isStart ? 'flex' : 'none' }">
          <i class="fas fa-play"></i>
        </div>

      </div>

    </div>



    <div v-if="ranks.length" class="table-container">
      <div class="table-row">
        <div>排名</div>
        <div class="name-column">名称</div>
        <div>时间</div>
        <div>步数</div>
      </div>
      <div v-for="(item, index) in ranks" :key="index" class="table-row">
        <div>{{ index + 1 }}</div>
        <div class="name-column">{{ item.username }}</div>
        <div>{{ item.spendTime }}</div>
        <div>{{ item.step }}</div>
      </div>
    </div>


    <div class="popup" :style="{ display: popVisible ? 'flex' : 'none' }" @click="hidePopup">
      <div class="popup-content">
        <img src="../../assets/arrow.png" alt="Your Image" class="popup-img">
      </div>
    </div>


    <Loading :visible="loadingVisible"></Loading>

  </div>
</template>

<style scoped>
.table-container {
  display: flex;
  flex-direction: column;
  margin-top: 10px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background-color: #f0f0f0;
}

.table-row {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid #ccc;
  text-align: center;
}

.table-row .name-column {
        flex-basis: 100px; /* 设置名称列的固定宽度 */
        word-wrap: break-word; /* 内容超出时换行 */
        overflow-wrap: break-word;
    }

.table-row:last-child {
  border-bottom: none;
}

body {
  margin: 0;
  padding: 0;
}

.popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  /* 半透明黑色背景 */
  z-index: 9999;
}

.popup-content {
  position: absolute;
  top: 0;
  right: 0;
}


.time-style {
  border-radius: 5px;
  background-color: lightblue;
  padding: 5px 10px;
}

.step-style {
  border-radius: 5px;
  background-color: lightblue;
  padding: 5px 10px;
}

.puzzle {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  background-color: #f5f5f5;
}

.child {
  width: calc(100% / 3);
  height: 100px;
  background-color: #fff;
  box-sizing: border-box;
}

div .child+.child {
  margin-left: -1px;
  /* 使用margin-left为-1px覆盖默认的margin（0） */
}

div .puzzle+.puzzle {
  margin-top: -1px;
  /* 使用margin-left为-1px覆盖默认的margin（0） */
}

.start-button {
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



.float-share-button {
  position: fixed;
  bottom: 20px;
  right: 80px;
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

.float-exchange-button {
  position: fixed;
  bottom: 20px;
  right: 140px;
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

.puzzle-image {
  max-width: 100%;
  max-height: 100%;
}
</style>

